from django.urls import path
from . import views
from .ReportGenerator import PDFReportView
urlpatterns = [
    path('', views.chatbot, name='chatbot'),
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
    path('logout', views.logout, name='logout'),
    path('download_report/', PDFReportView.as_view(), name='download_report'),
]