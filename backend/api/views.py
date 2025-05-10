from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import timedelta, date
from .models import Unit, Reservation, ShiftList, SystemSetting
from .serializers import LoginSerializer, LogoutSerializer, RegisterSerializer, UnitSerializer, ReservationSerializer, MyReservationSerializer, ShiftListSerializer, UserUpdateSerializer
from rest_framework.permissions import IsAuthenticated

# Kayıt olmav
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success_message": "Kayıt başarılı"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Giriş
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        
        #### Token kısmı 

        return Response({
            "user": {
                "name": user.first_name,
                "surname": user.last_name,
                "student_number": user.student_number,
                "email": user.email,
                "student_class": user.student_class
            }
        }, status=status.HTTP_200_OK)

# Çıkış
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]

        # refresh token blacklist kısmı 
        
        return Response({
            "message": "Çıkış isteği alındı. Token iptali sistemde yapılacak."
        }, status=status.HTTP_205_RESET_CONTENT)

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
        units = Unit.objects.all()
        serializer = UnitSerializer(units, many=True)
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




