from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import timedelta, date
from .models import Unit, Reservation, ShiftList, SystemSetting
from .serializers import LoginSerializer, LogoutSerializer, RegisterSerializer, UnitSerializer, ReservationSerializer, MyReservationSerializer, ShiftListSerializer, UserUpdateSerializer, PasswordChangeSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

# Kayıt olmav
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success_message": "Kayıt başarılı"}, status=status.HTTP_201_CREATED)
        
        # Hata mesajlarını birleştir
        error_messages = []
        for field, errors in serializer.errors.items():
            if isinstance(errors, list):
                for error in errors:
                    # Hata mesajlarını daha kullanıcı dostu hale getir
                    if field == 'student_number':
                        if "zaten kullanılmakta" in error:
                            error_messages.append("Bu öğrenci numarası zaten kullanılıyor")
                        else:
                            error_messages.append(error)
                    elif field == 'email':
                        if "zaten kullanılmaktadır" in error:
                            error_messages.append("Bu e-posta adresi zaten kullanılıyor")
                        else:
                            error_messages.append(error)
                    elif field == 'password':
                        if "eşleşmiyor" in error:
                            error_messages.append("Şifreler eşleşmiyor")
                        else:
                            error_messages.append(error)
                    else:
                        error_messages.append(error)
            else:
                error_messages.append(errors)
        
        return Response({
            "error": "Kayıt işlemi başarısız",
            "details": error_messages
        }, status=status.HTTP_400_BAD_REQUEST)

# Giriş
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # JWT token oluştur
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response({
            "user": {
                "name": user.first_name,
                "surname": user.last_name,
                "student_number": user.student_number,
                "email": user.email,
                "student_class": user.student_class
            },
            "access": access_token,
            "refresh": refresh_token
        }, status=status.HTTP_200_OK)

# Çıkış
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]

        # refresh token blacklist
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "message": "Çıkış başarılı. Token iptal edildi."
            }, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Token iptal edilemedi."}, status=status.HTTP_400_BAD_REQUEST)

class UserUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UserUpdateSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Bilgiler güncellendi.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Ünitleri gösterme (boş/dolu kontrolü yapılabilir)
class UnitListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        selected_date = request.query_params.get('selected_date')
        units = Unit.objects.all()
        
        # Kullanıcının sınıfına göre zaman dilimlerini filtrele
        user_class = request.user.student_class
        time_slots = []
        
        if user_class == "4":
            time_slots = ["09:00-10:30", "10:30-12:00"]
        elif user_class == "5":
            time_slots = ["13:30-15:30", "15:30-17:00"]
        
        serializer = UnitSerializer(units, many=True, context={
            'selected_date': selected_date,
            'available_time_slots': time_slots
        })
        return Response(serializer.data)

# Öğrenci kendi rezervasyonlarını görür
class MyReservationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(user=request.user)
        serializer = MyReservationSerializer(reservations, many=True)
        return Response(serializer.data)

# Rezervasyon yapma
class MakeReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Rezervasyon aktif mi kontrolü
        settings = SystemSetting.objects.last()
        if not settings or not settings.is_reservation_active:
            return Response({"error": "Rezervasyon şu an kapalı"}, status=403)

        serializer = ReservationSerializer(data=request.data, context ={"request": request})


        if serializer.is_valid():
            # Haftalık sınır 
            today = date.today()
            start_of_week = today - timedelta(days=today.weekday())  # Pazartesi
            end_of_week = start_of_week + timedelta(days=6)
            user_reservations = Reservation.objects.filter(user=request.user, date__range=[start_of_week, end_of_week])
            if user_reservations.count() >= 5:
                return Response({"error": "Haftalık rezervasyon hakkınızı doldurdunuz"}, status=400)

            reservation = serializer.save()
            return Response({"message": "Rezervasyon yapıldı",
                             "reservation_id": reservation.id
                             },status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)

class CancelReservationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, user=request.user)
        except Reservation.DoesNotExist:
            return Response({"error": "Rezervasyon bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        today = date.today()
        
        # Bugünün tarihi veya geçmiş rezervasyon iptal edilemez
        if reservation.date <= today:
            return Response({"error": "Bugünkü veya geçmiş tarihteki rezervasyonlar iptal edilemez."}, status=status.HTTP_400_BAD_REQUEST)

        # Rezervasyon tarihi yarınsa iptal edilemez
        if (reservation.date - today).days < 2:
            return Response({"error": "Randevu yalnızca en az 1 gün öncesinden iptal edilebilir."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.delete()
        return Response({"message": "Rezervasyon başarıyla iptal edildi."}, status=status.HTTP_204_NO_CONTENT)

# Nöbetçi listesi (Admin ekler)
class ShiftListView(APIView):
    def get(self, request):
        liste = ShiftList.objects.all()
        serializer = ShiftListSerializer(liste, many=True)
        return Response(serializer.data)

# Kullanıcı bilgilerini getir
class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "name": user.first_name,
            "surname": user.last_name,
            "student_number": user.student_number,
            "email": user.email,
            "student_class": user.student_class
        })

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Şifre başarıyla değiştirildi"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




