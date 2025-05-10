from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CancelReservationAPIView, LoginAPIView, LogoutAPIView, RegisterView
from .views import UnitListView, MakeReservationView, MyReservationsView, UserUpdateAPIView

urlpatterns = [
    path("register/", RegisterView.as_view(), name='register'),
    path("login/", LoginAPIView.as_view(), name='login'),
    path("token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("logout/", LogoutAPIView.as_view(), name='logout'),
    path("units/", UnitListView.as_view(), name='units'),
    path("update/", UserUpdateAPIView.as_view(), name="update"),
    path("reservation/make", MakeReservationView.as_view(), name='make-reservation'),
    path("reservation/cancel/<int:pk>", CancelReservationAPIView.as_view(), name='cancel-reservation'),
    path("my-reservations/", MyReservationsView.as_view(), name='my-reservations'),
]
