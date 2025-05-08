from rest_framework import serializers
from .models import User, Unit, Reservation, ShiftList
from django.contrib.auth import authenticate

# User oluşturma
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

            

    class Meta:
        model = User
        fields = ["student_number", "email", "first_name", "last_name", "student_class", "password'", "'password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Şifreler eşleşmiyor")
        return data
    
    def validate_student_number(self, value):
        if User.objects.filter(student_number = value).exists():
            raise serializers.ValidationError("Bu öğrenci numarası zaten kullanılmakta.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email = value).exists(): 
            raise serializers.ValidationError("Bu e posta zaten kullanılmaktadır.")
        return value

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
        fields = ["first_name", "last_name", "email", "student_class"]
             

# Üniti dolu/boş
class UnitSerializer(serializers.ModelSerializer):
    is_reserved = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = ["id", "number", "is_reserved"]

    def get_is_reserved(self, obj):
        selected_date = self.context.get("selected_date")  
        time_slot = self.context.get("time_slot")  

        if selected_date and time_slot:
            return Reservation.objects.filter(
                unit=obj,
                date=selected_date,
                time_slot=time_slot
            ).exists()
        return False
    
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
        fields = ["unit", "date", "time_slot"]

# Nöbetçi listesi
class ShiftListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftList
        fields = "__all__"
