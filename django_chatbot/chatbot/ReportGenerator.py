from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.views.generic import View
from django.shortcuts import render, redirect
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os
from .models import Summary
import datetime
class PDFReportView(View):
    def get(self, request):

        starttime = request.GET.get('starttime')
        starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')
        

        user_id = request.GET.get('username')
        user = request.user

        summary = Summary.objects.filter(user=user, created_at__date=starttime,
                                            created_at__hour=starttime.hour,
                                            created_at__minute=starttime.minute,

                                         ).first()
        #print(summary)
        print("user_id",user_id)
        if summary is None:
            summary = "No summary found"
        else:
            summary = summary.summary

        # Create a PDF document using ReportLab

        from io import BytesIO
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        # Create a list of flowables to build the PDF
        flowables = []
        # Define a style for the paragraph
        styles = getSampleStyleSheet()
        style = styles["Normal"]
        style.alignment = 1  # Center alignment
        # Create a paragraph element with the text and style
        paragraph = Paragraph(summary, style)
        # Add the paragraph to the list of flowables
        flowables.append(paragraph)
        # Add some space to separate the text from the margins
        flowables.append(Spacer(1, 12))
        # Build the PDF document
        doc.build(flowables)
        buffer.seek(0)
        response = FileResponse(buffer,
                                as_attachment=True,
                                filename=f'_{user_id}.pdf')
        response['Content-Disposition'] = 'inline; filename="output.pdf"'
        return response