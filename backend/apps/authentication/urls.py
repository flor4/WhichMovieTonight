from django.urls import path
from .views import RegisterView, UserInfoView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserInfoView.as_view(), name='user_info'),
    path('logout/', LogoutView.as_view(), name='logout')
]