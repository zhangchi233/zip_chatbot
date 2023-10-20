from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns=[path('login/<str:username>',views.body_part,name='body_part')]
