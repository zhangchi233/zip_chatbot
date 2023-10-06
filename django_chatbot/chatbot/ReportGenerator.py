from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.views.generic import View
from django.shortcuts import render, redirect
from django.http import HttpResponse
import os
class PDFReportView(View):
    def get(self, request):


        # Create a PDF document using ReportLab
        from io import BytesIO
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, "This is your PDF report.")
        # Add more content to the PDF as needed

        p.showPage()
        p.save()
        buffer.seek(0)
        response = FileResponse(buffer,
                                as_attachment=True,
                                filename='book_catalog.pdf')
        return response
