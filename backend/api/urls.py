from django.urls import path
from .views import (
    CancelReservationAPIView, DutyScheduleListView, LoginAPIView, LogoutAPIView, RegisterView, TeacherStudentListView ,
    UnitListView, MakeReservationView, MyReservationsView, UserUpdateAPIView,
    UserInfoView, ChangePasswordView, TeacherReservationsView, DeletePastReservationsView, StudentMessagesView, DutyTeacherByDateView, TeacherListView, MessageListCreateView, SentMessagesView, InboxView, SentBoxView, UserMessageReadView, UserMessageDeleteView
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
    path("reservation/delete-past/", DeletePastReservationsView.as_view(), name='delete-past-reservations'),
    path("reservation/delete-past/<int:pk>/", DeletePastReservationsView.as_view(), name='delete-single-past-reservation'),
    path("my-reservations/", MyReservationsView.as_view(), name='my-reservations'),
    path("reservations/", TeacherReservationsView.as_view(), name='teacher-reservations'),
    path("student/", TeacherStudentListView.as_view(), name='teacher-student'),
    path("duty-schedule/", DutyScheduleListView.as_view(), name="duty-schedule-list"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path('messages/', MessageListCreateView.as_view(), name='messages'),
    path('messages/<int:pk>/', StudentMessagesView.as_view(), name='student-message-detail'),
    path("duty-teacher/", DutyTeacherByDateView.as_view(), name="duty-teacher-by-date"),
    path("teachers/", TeacherListView.as_view(), name="teacher-list"),
    path('sent-messages/', SentMessagesView.as_view(), name='sent-messages'),
    path('inbox/', InboxView.as_view(), name='inbox'),
    path('sentbox/', SentBoxView.as_view(), name='sentbox'),
    path('usermessage/<int:pk>/', UserMessageReadView.as_view(), name='usermessage-read'),
    path('usermessage/<int:pk>/delete/', UserMessageDeleteView.as_view(), name='usermessage-delete'),
]
