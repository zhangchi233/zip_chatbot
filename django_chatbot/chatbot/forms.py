from django import forms
from .models import Report
class ReportForm(forms.ModelForm):
    user_name = forms.CharField(max_length=100)  # Add a field for the user's name

    class Meta:
        model = Report
        fields = ['user_name', 'report', 'images']