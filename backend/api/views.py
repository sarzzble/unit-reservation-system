from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,filters,generics
from datetime import datetime, timedelta, date
from .models import DutySchedule, Unit, Reservation, SystemSetting,User, Message
from .serializers import DutyScheduleSerializer, LoginSerializer, LogoutSerializer, RegisterSerializer, TeacherStudentSerializer, UnitSerializer, ReservationSerializer, MyReservationSerializer, UserUpdateSerializer, PasswordChangeSerializer, TeacherReservationSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend 
from django.db.models import Q
from django.db import models

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
        now = datetime.now()
        today = now.date()
        current_time = now.time()

        active_reservations = []
        past_reservations = []

        for res in reservations:
            if res.date < today:
                past_reservations.append(res)
            elif res.date > today:
                active_reservations.append(res)
            else:  # res.date == today
                slot_end = res.time_slot.split("-")[1]
                end_hour, end_minute = map(int, slot_end.split(":"))
                slot_end_time = datetime.combine(today, datetime.min.time()).replace(hour=end_hour, minute=end_minute).time()
                if current_time < slot_end_time:
                    active_reservations.append(res)
                else:
                    past_reservations.append(res)

        return Response({
            "active": MyReservationSerializer(active_reservations, many=True).data,
            "past": MyReservationSerializer(past_reservations, many=True).data,
        })

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
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(student_number__icontains=search)
            )
        return queryset

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
        now = datetime.now()
        current_time = now.time()

        if pk:
            # Tek bir geçmiş rezervasyonu sil
            try:
                reservation = Reservation.objects.get(pk=pk, user=request.user)
                is_past = False
                if reservation.date < today:
                    is_past = True
                elif reservation.date == today:
                    slot_end = reservation.time_slot.split("-")[1]
                    end_hour, end_minute = map(int, slot_end.split(":"))
                    slot_end_time = datetime.combine(today, datetime.min.time()).replace(hour=end_hour, minute=end_minute).time()
                    if current_time >= slot_end_time:
                        is_past = True
                if is_past:
                    reservation.delete()
                    return Response({"message": "Geçmiş rezervasyon başarıyla silindi."}, status=status.HTTP_204_NO_CONTENT)
                return Response({"error": "Sadece geçmiş rezervasyonlar silinebilir."}, status=status.HTTP_400_BAD_REQUEST)
            except Reservation.DoesNotExist:
                return Response({"error": "Rezervasyon bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Tüm geçmiş rezervasyonları sil
            past_reservations = []
            reservations = Reservation.objects.filter(user=request.user)
            for res in reservations:
                is_past = False
                if res.date < today:
                    is_past = True
                elif res.date == today:
                    slot_end = res.time_slot.split("-")[1]
                    end_hour, end_minute = map(int, slot_end.split(":"))
                    slot_end_time = datetime.combine(today, datetime.min.time()).replace(hour=end_hour, minute=end_minute).time()
                    if current_time >= slot_end_time:
                        is_past = True
                if is_past:
                    past_reservations.append(res)
            count = len(past_reservations)
            for res in past_reservations:
                res.delete()
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
            "id": user.id,
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
        # Gelen kutusu: sadece silinmemiş mesajlar
        messages = Message.objects.filter(recipient=user, recipient_deleted=False).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def patch(self, request, pk=None):
        user = request.user
        if not pk:
            return Response({"error": "Mesaj ID gerekli."}, status=400)
        msg = Message.objects.filter(pk=pk).filter(models.Q(sender=user) | models.Q(recipient=user)).first()
        if not msg:
            return Response({"error": "Mesaj bulunamadı."}, status=404)
        is_read = request.data.get("is_read")
        if is_read is not None:
            msg.is_read = bool(is_read)
            msg.save()
            return Response({"message": "Mesaj okundu olarak işaretlendi."})
        return Response({"error": "is_read alanı gerekli."}, status=400)

    def delete(self, request, pk=None):
        user = request.user
        if pk:
            msg = Message.objects.filter(pk=pk).filter(models.Q(sender=user) | models.Q(recipient=user)).first()
            if msg:
                # Soft delete mantığı
                if msg.sender == user:
                    msg.sender_deleted = True
                if msg.recipient == user:
                    msg.recipient_deleted = True
                # Eğer her iki taraf da silmişse fiziksel olarak sil
                if msg.sender_deleted and msg.recipient_deleted:
                    msg.delete()
                    return Response({"message": "Mesaj tamamen silindi."}, status=204)
                else:
                    msg.save()
                    return Response({"message": "Mesaj kutunuzdan silindi."}, status=200)
            else:
                return Response({"error": "Mesaj bulunamadı."}, status=404)
        else:
            # Tüm mesajları silmek isteyen kullanıcı için
            user_msgs = Message.objects.filter(models.Q(sender=user) | models.Q(recipient=user))
            count = 0
            for msg in user_msgs:
                changed = False
                if msg.sender == user and not msg.sender_deleted:
                    msg.sender_deleted = True
                    changed = True
                if msg.recipient == user and not msg.recipient_deleted:
                    msg.recipient_deleted = True
                    changed = True
                if msg.sender_deleted and msg.recipient_deleted:
                    msg.delete()
                    count += 1
                elif changed:
                    msg.save()
                    count += 1
            return Response({"message": f"{count} mesaj kutunuzdan silindi."}, status=200)

class DutyTeacherByDateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"error": "Tarih parametresi gerekli (YYYY-MM-DD)."}, status=400)
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Tarih formatı YYYY-MM-DD olmalı."}, status=400)

        weekday = target_date.weekday()
        if weekday > 4:
            return Response({"error": "Hafta sonu için nöbetçi öğretmen yok."}, status=400)

        # Hangi gün ise o günün alanında bu tarih olan kaydı bul
        day_field = ["monday", "tuesday", "wednesday", "thursday", "friday"][weekday]
        filter_kwargs = {day_field: date_str}
        duty = DutySchedule.objects.filter(**filter_kwargs).first()
        if not duty:
            return Response({"error": "Nöbetçi öğretmen bulunamadı."}, status=404)
        teacher = duty.teacher
        return Response({
            "first_name": teacher.first_name,
            "last_name": teacher.last_name,
            "email": teacher.email
        })

class TeacherListView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=True)
    serializer_class = TeacherStudentSerializer
    permission_classes = [permissions.IsAuthenticated]

class MessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        messages = Message.objects.all().order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        recipient_id = request.data.get("recipient")
        if not User.objects.filter(pk=recipient_id).exists():
            return Response({"recipient": [f"Geçersiz pk \"{recipient_id}\" - obje bulunamadı."]}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SentMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Gönderilen kutusu: sadece silinmemiş mesajlar
        messages = Message.objects.filter(sender=user, sender_deleted=False).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)




