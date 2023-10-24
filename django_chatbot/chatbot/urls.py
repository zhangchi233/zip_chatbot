from django.urls import path, include
from . import views
from .views import ChatView
from .views import LoginView
from .views import RegisterView
from .views import OpenaiView
from django.conf import settings
from django.conf.urls.static import static
from .ReportGenerator import PDFReportView
urlpatterns = [
    path('chatlist', ChatView.as_view(), name='ChatView'),
    # path('user/<str:username>/selection/dialogue', views.chatbot, name='chatbot'),
    path('login', LoginView.as_view(), name='loginapi'),
    # path('djangologin', views.login, name='login'),
    # path('', views.empty, name='empty'),
    # path('register', views.register, name='register'),
    # path('last_ten_chats', views.LastTenChatsView.as_view(), name='last-ten-chats'),
    path('logout', views.api_logout, name='logout'),
    path('register', RegisterView.as_view(), name='registerapi'),
    path('logout', views.logout, name='logout'),
    path('download_report', PDFReportView.as_view(), name='download_report'),
    path('upload', views.upload_image,name = "upload"), 
    # path('user/<str:username>/selection/', views.chatbot_view, name='chatbot_view'),
    path('get-csrf-token', views.get_csrf_token, name='get_csrf_token'),
    path('openai', OpenaiView.as_view(), name='openai_chat_endpoint'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)