from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

# Kullanıcıyı (öğrenci/admin) yöneten yapı
class UserManager(BaseUserManager):
    def create_user(self, student_number, email, password=None, **extra_fields):
        if not student_number:
            raise ValueError("Öğrenci numarası gerekli")
        if not email:
            raise ValueError("Email adresi gerekli")
        email = self.normalize_email(email)
        user = self.model(student_number=student_number, email=email, **extra_fields)
        user.set_password(password)  # Şifreyi hash'ler
        user.save(using=self._db)
        return user
    
    def create_superuser(self, student_number, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(student_number, email, password, **extra_fields)

# Kullanıcı Modeli
class User(AbstractBaseUser,PermissionsMixin):
    student_number = models.CharField(
        max_length=12, 
        unique=True,
        error_messages={
            'unique': 'Bu öğrenci numarası zaten kullanılıyor',
        }
    )
    email = models.EmailField(
        unique=True,
        error_messages={
            'unique': 'Bu e-posta adresi zaten kullanılıyor',
        }
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    CLASS_CHOICES = [
        ("4", "4. Sınıf"),
        ("5", "5. Sınıf")
    ]
    student_class = models.CharField(
        choices=CLASS_CHOICES,
        max_length=1,
        error_messages={
            'blank': 'Sınıf seçimi zorunludur',
            'invalid_choice': 'Geçerli bir sınıf seçiniz (4. veya 5. sınıf)'
        }
    )
    is_staff = models.BooleanField(default=False)  # Admin mi?
    is_active = models.BooleanField(default=True)  # Aktif mi?
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()


    USERNAME_FIELD = "student_number"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.student_number}"
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser or self.is_staff

    def has_module_perms(self, app_label):
        return self.is_superuser or self.is_staff
    

# Ünitler
class Unit(models.Model):
    number = models.PositiveIntegerField(unique=True)  

    def __str__(self):
        return f"Ünit {self.number}"

# Öğrencinin ünit seçimi 
class Reservation(models.Model):
    TIME_CHOICES = [
        ("09:00-10:30", "09:00-10:30"),
        ("10:30-12:00", "10:30-12:00"),
        ("13:30-15:30", "13:30-15:30"),
        ("15:30-17:00", "15:30-17:00"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    date = models.DateField()
    time_slot = models.CharField(max_length=20, choices=TIME_CHOICES)

    class Meta:
        pass  # unique_together ve constraints kaldırıldı
    
    def __str__(self):
        return f"{self.user.student_number} - {self.unit.number} - {self.date} - {self.time_slot}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
# Rezervasyon sistemi açıp katmatma
class SystemSetting(models.Model):
    is_reservation_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
  
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["is_reservation_active"], name="unique_system_setting")
        ]


# nöbetçi listesi
class DutySchedule(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="duty_schedules")
    date = models.DateField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Duty Schedule: {self.teacher.email} - {self.date}"

# Mesajlar
class Message(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages', null=True, blank=True)
    recipient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    sender_deleted = models.BooleanField(default=False)
    recipient_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.title}"

# Kullanıcıya özel mesaj kutusu
class UserMessage(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_messages')
    message = models.ForeignKey('Message', on_delete=models.CASCADE, related_name='user_messages')
    box_type = models.CharField(max_length=10, choices=[('inbox', 'Inbox'), ('sent', 'Sent')])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.box_type} - {self.message.title}"