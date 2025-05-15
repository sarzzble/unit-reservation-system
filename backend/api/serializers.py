from rest_framework import serializers
from .models import User, Unit, Reservation, ShiftList
from django.contrib.auth import authenticate

# User oluşturma
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["student_number", "email", "first_name", "last_name", "student_class", "password", "password2"]
        extra_kwargs = {
            "password": {"write_only": True},
            "first_name": {"error_messages": {"blank": "Ad alanı boş bırakılamaz"}},
            "last_name": {"error_messages": {"blank": "Soyad alanı boş bırakılamaz"}},
            "student_class": {"error_messages": {"blank": "Sınıf seçimi zorunludur"}},
            "email": {"error_messages": {"blank": "E-posta adresi zorunludur", "invalid": "Geçerli bir e-posta adresi giriniz"}},
            "student_number": {"error_messages": {"blank": "Öğrenci numarası zorunludur"}}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Şifreler eşleşmiyor"})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")  # password2'yi çıkar
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # şifreyi hash'le
        user.save()
        return user

#User giriş
class LoginSerializer(serializers.Serializer):
    student_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        student_number = data.get("student_number")
        password =data.get("password")

        if student_number and password:
            user = authenticate(student_number= student_number,password=password)
            
            if user is None:
                raise serializers.ValidationError("Öğrenci numarası veya şifre yanlış.")
            if not user.is_active:
                raise serializers.ValidationError("Bu kullanıcı aktif değil.")
        else:
            raise serializers.ValidationError("Lütfen tüm alanları doldurun")
        
        data["user"] = user
        return data

# User Çıkış
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        refresh = attrs.get("refresh")

        if not refresh:
            raise serializers.ValidationError("Refresh token gereklidir.")

        return attrs

# User bilgi güncelleme
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email"]
        extra_kwargs = {
            "email": {"error_messages": {"blank": "E-posta adresi zorunludur", "invalid": "Geçerli bir e-posta adresi giriniz"}}
        }

# Üniti dolu/boş
class UnitSerializer(serializers.ModelSerializer):
    reserved_time_slots = serializers.SerializerMethodField()
    available_time_slots = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = ["id", "number", "reserved_time_slots", "available_time_slots"]

    def get_reserved_time_slots(self, obj):
        selected_date = self.context.get("selected_date")
        available_time_slots = self.context.get("available_time_slots", [])
        
        if selected_date and available_time_slots:
            # Get all reservations for this unit on the selected date
            reservations = Reservation.objects.filter(
                unit=obj,
                date=selected_date,
                time_slot__in=available_time_slots  # Sadece kullanıcının sınıfına uygun zaman dilimlerini kontrol et
            )
            # Return list of reserved time slots
            return [res.time_slot for res in reservations]
        return []

    def get_available_time_slots(self, obj):
        return self.context.get("available_time_slots", [])
    
# Rezervasyon işlemi 
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["unit", "date", "time_slot"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user
        unit = attrs["unit"]
        date = attrs["date"]
        time_slot = attrs["time_slot"]

        # Aynı kullanıcı aynı gün aynı saate bir rezervasyon yapmış mı?
        if Reservation.objects.filter(user=user, date=date, time_slot=time_slot).exists():
            raise serializers.ValidationError("Bu saat aralığında zaten bir rezervasyonunuz var.")

        # Bu üniti başkası rezerve etmiş mi?
        if Reservation.objects.filter(unit=unit, date=date, time_slot=time_slot).exists():
            raise serializers.ValidationError("Bu diş üniti bu saat aralığında dolu.")

        return attrs
    
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        return Reservation.objects.create(user=user, **validated_data)

# Öğrenci rezervasyonlarını göster
class MyReservationSerializer(serializers.ModelSerializer):
    unit = UnitSerializer()

    class Meta:
        model = Reservation
        fields = ["id", "unit", "date", "time_slot"]

# Nöbetçi listesi
class ShiftListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftList
        fields = "__all__"

# Şifre değiştirme
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "Yeni şifreler eşleşmiyor"})
        return data

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mevcut şifre yanlış")
        return value
