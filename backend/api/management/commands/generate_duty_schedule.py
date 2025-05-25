from django.core.management.base import BaseCommand
from api.models import DutySchedule, User
from datetime import date, timedelta
from django.db import transaction

class Command(BaseCommand):
    help = 'Haftalık döngüsel olarak tüm öğretmenlere pazar gününden başlayarak nöbet ataması yapar.'

    def handle(self, *args, **options):
        today = date.today()
        # Haftanın ilk günü (pazar) bul
        start = today - timedelta(days=today.weekday() + 1) if today.weekday() != 6 else today
        teachers = list(User.objects.filter(is_staff=True, is_active=True))
        if not teachers:
            self.stdout.write(self.style.ERROR('Hiç öğretmen yok!'))
            return
        # Son nöbetçi gününü bul
        last_duty = DutySchedule.objects.order_by('-date').first()
        if last_duty:
            start = last_duty.date + timedelta(days=1)
        # Atanmamış öğretmen var mı kontrol et
        duty_dates = set(DutySchedule.objects.values_list('teacher_id', flat=True))
        unassigned_teachers = [t for t in teachers if t.id not in duty_dates]
        if unassigned_teachers:
            assign_teachers = unassigned_teachers
        else:
            assign_teachers = teachers
        # Öğretmen sayısı kadar gün için sırayla atama, sadece hafta içi (pazartesi-cuma)
        with transaction.atomic():
            i = 0
            assigned = 0
            duty_dates = []
            while assigned < len(assign_teachers):
                duty_date = start + timedelta(days=i)
                # Hafta sonu ise atlama
                if duty_date.weekday() >= 5:  # 5: Cumartesi, 6: Pazar
                    i += 1
                    continue
                teacher = assign_teachers[assigned]
                DutySchedule.objects.create(teacher=teacher, date=duty_date)
                duty_dates.append((duty_date, teacher))
                assigned += 1
                i += 1
            # Tarihe göre yakın tarihten uzağa sıralı çıktı
            for duty_date, teacher in sorted(duty_dates, key=lambda x: x[0]):
                self.stdout.write(self.style.SUCCESS(f"{duty_date}: {teacher.first_name} {teacher.last_name}"))
        self.stdout.write(self.style.SUCCESS(f'{len(duty_dates)} günlük nöbetçi öğretmen listesi oluşturuldu.'))
