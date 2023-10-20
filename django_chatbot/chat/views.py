from django.shortcuts import render
import pandas as pd
# Create your views here.
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings
BASE_DIR = str(settings.BASE_DIR)

def body_part(request,username):
    if request.method == 'GET':
        question_path = BASE_DIR + "/questionnaire/questionnaire.csv"

        body_part = request.GET.get('bodypart')
        gender = request.GET.get("gender")

        questions = pd.read_csv(question_path,delimiter=';')
        # gender is female/female and both can be selected
        conditions = (questions['body_part'] == body_part) * ((questions["gender"]==gender) \
                                                               + (questions["gender"]=="both"))
        specific_questions = questions[conditions]["question"].tolist()
        print(specific_questions)
        json_response  = {"questions":specific_questions}
        return JsonResponse(json_response)
    response = HttpResponse("Not a GET request")
    return response