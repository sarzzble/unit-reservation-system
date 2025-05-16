from django.urls import path
from .views import (
    CancelReservationAPIView, LoginAPIView, LogoutAPIView, RegisterView,
    UnitListView, MakeReservationView, MyReservationsView, UserUpdateAPIView,
    UserInfoView, ChangePasswordView, TeacherReservationsView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name='register'),
    path("login/", LoginAPIView.as_view(), name='login'),
    path("units/", UnitListView.as_view(), name='units'),
    path("logout/", LogoutAPIView.as_view(), name='logout'),
    path("update/", UserUpdateAPIView.as_view(), name="update"),
    path("user/", UserInfoView.as_view(), name="user-info"),
    path("reservation/make/", MakeReservationView.as_view(), name='make-reservation'),
    path("reservation/cancel/<int:pk>/", CancelReservationAPIView.as_view(), name='cancel-reservation'),
    path("my-reservations/", MyReservationsView.as_view(), name='my-reservations'),
    path("reservations/", TeacherReservationsView.as_view(), name='teacher-reservations'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
