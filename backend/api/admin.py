from django.contrib import admin
from .models import User, Reservation,SystemSetting,ShiftList


# öğrencileri gösterir
@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "student_number", "student_class", "email", "is_staff")
    search_fields = ("user__first_name", "user__last_name", "student_number")
    list_filter = ("student_class",)

# rezervasyonlara bakılır
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("user", "unit", "date", "time_slot")
    search_fields = ("user__first_name", "user__last_name", "unit__name")
    list_filter = ("date", "time_slot", "unit")

admin.site.register(SystemSetting) # rezervasyon sistemini açar ve kapatır
admin.site.register(ShiftList) # Metin girdisi alır

