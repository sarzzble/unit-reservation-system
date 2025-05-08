from django.contrib.auth.backends import BaseBackend
from .models import User


# isim soyisim yerine öğrenci numarası ile giriş alma 
class StudentNumberBackend(BaseBackend):
    def authenticate(self, request, student_number=None, password=None, **kwargs):
        try:
            user = User.objects.get(student_number=student_number)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None