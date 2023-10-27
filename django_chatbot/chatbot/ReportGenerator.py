from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.views.generic import View
from django.shortcuts import render, redirect
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
import os
from .models import Summary
import datetime
from rest_framework.response import Response

@permission_classes([IsAuthenticated])    
class PDFReportView(View):
    def get(self, request):
        starttime = request.GET.get('starttime')
        starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')
        user_id = request.GET.get('username')
        user = request.user
        print(user_id)
        summary = Summary.objects.filter(user__username=user_id, ).order_by('-created_at').first()
        if summary is None:
            summary = "No summary found"
        else:
            summary = summary.summary
            # remove Please confirm 'yes' or 'no'. please type:'yes' or 'no' to indicate whether the summary is correct or not if you agree with the summary please sign and upload
            summary = summary.replace("please type:'yes' or 'no' to indicate whether the summary is correct or not if you agree with the summary please sign and upload",
                                      "Please sign and upload the summary")
            # remove 'no, chatgpt will give a summary Upon analyzing the conversation,
            summary = summary.replace("'no, chatgpt will give a summary", "Here is your report:")
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