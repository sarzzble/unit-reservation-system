from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,filters,generics
from datetime import datetime, timedelta, date
from .models import DutySchedule, Unit, Reservation, SystemSetting,User, Message
from .serializers import DutyScheduleSerializer, LoginSerializer, LogoutSerializer, RegisterSerializer, TeacherStudentSerializer, UnitSerializer, ReservationSerializer, MyReservationSerializer, UserUpdateSerializer, PasswordChangeSerializer, TeacherReservationSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend 

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
                "student_class": user.student_class,
                "is_staff": user.is_staff  # Öğretmen/öğrenci ayrımı için
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
        # Eğer mevcut e-posta ile yeni e-posta aynıysa hata döndür
        if request.data.get('email') == request.user.email:
            return Response(
                {"email": ["Girdiğiniz e-posta adresi mevcut e-posta adresiniz ile aynı. Lütfen farklı bir e-posta adresi girin."]},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        
        if user_class == "5":
            time_slots = ["09:00-10:30", "10:30-12:00"]
        elif user_class == "4":
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

class TeacherReservationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Bu işlem için yetkiniz yok"}, status=status.HTTP_403_FORBIDDEN)

        # Query parametresinden student_number alınır
        student_number = request.query_params.get("student_number", None)

        # Şu anki tarih ve saat
        now = datetime.now()
        today = now.date()
        current_time = now.time()

        if student_number:
            reservations = Reservation.objects.filter(user__student_number=student_number)
        else:
            reservations = Reservation.objects.all()

        # Geçmiş tarihli ve bugünün geçmiş saatli rezervasyonları filtrele
        filtered_reservations = []
        for res in reservations:
            if res.date < today:
                continue
            if res.date == today:
                slot_start = res.time_slot.split("-")[0]
                slot_hour, slot_minute = map(int, slot_start.split(":"))
                slot_time = datetime.combine(today, datetime.min.time()).replace(hour=slot_hour, minute=slot_minute).time()
                if slot_time <= current_time:
                    continue
            filtered_reservations.append(res)

        filtered_reservations = sorted(filtered_reservations, key=lambda r: (r.date, r.time_slot))
        serializer = TeacherReservationSerializer(filtered_reservations, many=True)
        return Response(serializer.data)
    
class TeacherStudentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherStudentSerializer

    # Sadece öğrencileri getir
    queryset = User.objects.filter(is_staff=False)

    # Filtreleme ve sıralama desteği
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["student_class", "student_number"]  # filtrelenebilecek alanlar
    ordering_fields = ["first_name", "last_name", "student_number", "student_class"]
    ordering = ["first_name"]  # varsayılan sıralama

    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.none()  # Yetkisi olmayanlar için boş veri
        return super().get_queryset()


# Rezervasyon yapma
class MakeReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Rezervasyon aktif mi kontrolü
        settings = SystemSetting.objects.last()
        if not settings or not settings.is_reservation_active:
            return Response({"error": "Rezervasyon şu an kapalı"}, status=403)

        serializer = ReservationSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            # Kullanıcının yapmak istediği rezervasyon tarihi
            reservation_date_str = request.data.get("date")
            if not reservation_date_str:
                return Response({"error": "Rezervasyon tarihi belirtilmeli"}, status=400)

            try:
                reservation_date = datetime.strptime(reservation_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Tarih formatı YYYY-MM-DD olmalı"}, status=400)

            # Haftanın başlangıç ve bitiş tarihi (rezervasyon tarihine göre)
            start_of_week = reservation_date - timedelta(days=reservation_date.weekday())  # Pazartesi
            end_of_week = start_of_week + timedelta(days=6)

            user_reservations = Reservation.objects.filter(user=request.user, date__range=[start_of_week, end_of_week])
            if user_reservations.count() >= 5:
                return Response({"error": "Haftalık rezervasyon hakkınızı doldurdunuz"}, status=400)

            reservation = serializer.save()
            return Response({
                "message": "Rezervasyon yapıldı",
                "reservation_id": reservation.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)

class CancelReservationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        # Silme işlemi için öğretmen tüm rezervasyonları, öğrenci ise sadece kendi rezervasyonunu silebilir
        if request.user.is_staff:
            reservation = Reservation.objects.get(pk=pk)
        else:
            reservation = Reservation.objects.get(pk=pk, user=request.user)

        today = date.today()
        
        # Bugünün tarihi veya geçmiş rezervasyon iptal edilemez
        if reservation.date <= today:
            return Response({"error": "Bugünkü rezervasyonlar iptal edilemez."}, status=status.HTTP_400_BAD_REQUEST)

        # Rezervasyon tarihi yarınsa iptal edilemez
        if (reservation.date - today).days < 2:
            return Response({"error": "Randevu yalnızca en az 1 gün öncesinden iptal edilebilir."}, status=status.HTTP_400_BAD_REQUEST)

        # Rezervasyon siliniyor
        student_user = reservation.user
        reservation_info = f"{reservation.unit.number} numaralı ünit, {reservation.date} {reservation.time_slot}"
        reservation.delete()
        # Eğer öğretmen ise öğrenciye mesaj gönder
        if request.user.is_staff:
            Message.objects.create(
                user=student_user,
                title="Rezervasyonunuz İptal Edildi",
                content=f"{reservation_info} için yaptığınız rezervasyon öğretmen tarafından iptal edildi. Detaylar için öğretmeninizle iletişime geçebilirsiniz."
            )
        return Response({"message": "Rezervasyon başarıyla iptal edildi."}, status=status.HTTP_204_NO_CONTENT)

# Geçmiş rezervasyonları silme
class DeletePastReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk=None):
        today = date.today()
        
        if pk:
            # Tek bir geçmiş rezervasyonu sil
            try:
                reservation = Reservation.objects.get(pk=pk, user=request.user)
                if reservation.date < today:
                    reservation.delete()
                    return Response({"message": "Geçmiş rezervasyon başarıyla silindi."}, status=status.HTTP_204_NO_CONTENT)
                return Response({"error": "Sadece geçmiş rezervasyonlar silinebilir."}, status=status.HTTP_400_BAD_REQUEST)
            except Reservation.DoesNotExist:
                return Response({"error": "Rezervasyon bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Tüm geçmiş rezervasyonları sil
            past_reservations = Reservation.objects.filter(user=request.user, date__lt=today)
            count = past_reservations.count()
            past_reservations.delete()
            return Response({"message": f"{count} adet geçmiş rezervasyon başarıyla silindi."}, status=status.HTTP_200_OK)

# Nöbetçi listesi (Admin ekler)
class DutyScheduleCreateView(generics.CreateAPIView):
    queryset = DutySchedule.objects.all()
    serializer_class = DutyScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

# Nöbetci listesi gönderilir.
class DutyScheduleListView(generics.ListAPIView):
    serializer_class = DutyScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DutySchedule.objects.all().order_by("-created_at")
    
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
            "student_class": user.student_class,
            "is_staff": user.is_staff
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

class StudentMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(user=user).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def delete(self, request, pk=None):
        user = request.user
        if pk:
            try:
                msg = Message.objects.get(pk=pk, user=user)
                msg.delete()
                return Response({"message": "Mesaj silindi."}, status=204)
            except Message.DoesNotExist:
                return Response({"error": "Mesaj bulunamadı."}, status=404)
        else:
            deleted, _ = Message.objects.filter(user=user).delete()
            return Response({"message": f"{deleted} mesaj silindi."}, status=200)




