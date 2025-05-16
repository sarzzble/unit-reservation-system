from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_test_teacher(apps, schema_editor):
    User = apps.get_model('api', 'User')
    User.objects.create(
        student_number='123456789012',
        password=make_password('test123'),
        email='test.teacher@example.com',
        first_name='Test',
        last_name='Teacher',
        is_staff=True,
        is_active=True,
        student_class='0'  # Since this is a teacher
    )

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0009_remove_reservation_unique_reservation_and_more'),
    ]

    operations = [
        migrations.RunPython(create_test_teacher),
    ] 