from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .ReportGenerator import PDFReportView
urlpatterns = [
    path('user/<str:username>/selection/dialogue', views.chatbot, name='chatbot'),
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
    path('logout', views.logout, name='logout'),
    path('user/<str:username>/selection/download_report', PDFReportView.as_view(), name='download_report'),
    path('upload', views.upload_image,name = "upload"), # add selection body part
    path('user/<str:username>/selection/', views.chatbot_view, name='chatbot_view'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)