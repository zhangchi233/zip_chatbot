from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from django.views.generic import View
from django.shortcuts import render, redirect
from django.http import HttpResponse
import os
import datetime
from django.contrib.auth.models import User
class PDFReportView(View):
    def get(self, request,username):

        summary = request.GET.get('summary')
        print("summary is ",summary)
        user_id = request.GET.get('userId')
        time = str(datetime.datetime.now())
        # Create a PDF document using ReportLab
        from io import BytesIO
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, summary)
        # Add more content to the PDF as needed

        p.showPage()
        p.save()
        buffer.seek(0)
        response = FileResponse(buffer,
                                as_attachment=True,
                                filename=time+f'_{user_id}.pdf')
        return response