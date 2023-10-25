from django.contrib import admin
from .models import Chat, Report, Summary

# Register your models here.
admin.site.register(Chat)
admin.site.register(Report)
admin.site.register(Summary)
