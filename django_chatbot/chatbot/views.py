import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
import openai
from .forms import ReportForm
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Chat, Report, Summary
import datetime
from rest_framework import generics, status
from .serializer import ChatSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.conf import settings


# from django.http import HttpResponse

BASE_DIR = str(settings.BASE_DIR)
open_ai_key_path = BASE_DIR+"/api_key.txt"
with open(open_ai_key_path, "r") as f:
    openai_api_key = f.read().strip()
openai.api_key = openai_api_key
general_questions ='''
General questions devided into categories

1. Medical History and Conditions:
Allergy
Relevant disease or condition
Infections
Medicine history
History of surgery
History of pulmonary diseases
History of miscarriage or other reproductive complications
History of hernias, maldescended testes, AAA
Current medication
History of infections (mumps, meningitis)
Diabetes
Obesity
Pregnancy
Fertility related
Infections associated with sex
Sexual behavior
2. Physical Health and Symptoms: 
Weight
BMI
Fatigue
Sweats
Breath
Fainting
Palpitations
Diet
Stool
Vomiting
Clotting
Lump
Bleeding
Menstrual cycle
Muscle/coordination
Movement impairment
Muscle tone
Sensations (deaf, irritation, tingling, loss)
Nausea
Taste
Tremors
Seizures
Dizziness
Reflexes
Joints
Bones
Anorexia
Hygiene
Catheter
3. Mental Health and Behavior: 
Sleep
Mental health
Impaired mental abilities
Stress
Aggression
Attention/concentration
Confusion
Disorientation
Memory
Impulsiveness
Changes in behavior, personality
Awareness
Compulsiveness
Hallucinations
Mood
Self harm
Panic disorder
Substance use (Alcohol/drugs)
Smoking
Mood/feeling
4. Social and Personal Information:  
Background - Social situation
Family history
General background
Marital status
Gender
Gender partner
Organ donor
Living conditions
Living conditions - house
Living conditions - people
Reason to visit
Previous hospitalizations
Religious orientation
Inadequate social support
ADHD
Psychiatric disorders in family
Psychosocial problems (bullying, separation parents, death family member etc.)
Depressive symptoms
Hallucinations
Delusions
Memory Disorder
Compulsions
Psychiatric disorders
Recent head injury
Fear
Relationship
Work-related problems
In contact with animals?
Profession
Abuse
Issues with daily activities
5. Sexual Health and Behavior: 98. Sex
Sexual preference
Sexual behavior
'''

class ChatView(generics.ListAPIView):
    serializer_class = ChatSerializer
    queryset = Chat.objects.all()
# @method_decorator(csrf_exempt, name='dispatch')
# @api_view(['POST'])
@permission_classes([IsAuthenticated])    
class OpenaiView(APIView):
    def post(self, request):
        data = request.data
        message = data.get('message')
        nmessages = data.get('nmessages')
        # print("nmessages is",nmessages)

        # Get the start time
        starttime = data.get('starttime')
        starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')
        
        # Fetch previous chat records for the user and the given start time
        chats = Chat.objects.filter(user=request.user, starttime__date=starttime.date(),
                                    starttime__hour=starttime.hour, starttime__minute=starttime.minute,
                                    starttime__second=starttime.second).order_by('created_at')
        # print(chats.exists())
        if not chats.exists():
            print("here")
            jsonresponse = self.chatbot_view(request.user, data, request)
            # body_part = data.get('body_part', 'unspecified body part')
            # # message = body_part
            # response = ask_openai(message, "there is no previous message, but remember to ask question one by one")
            # # response = "Everyone has pain in life, we can share our pain together"
            # chat = Chat(user=request.user, message=message, starttime=starttime, created_at=timezone.now(), response=response)
            # chat.save()
            return jsonresponse
        # Prepare the previous dialogues for context

        z = []
        for chat in chats:
            z.append(chat.message)
            z.append(chat.response)
        chat_messages = " \n ".join(z)

        # Get a response from OpenAI
        response = ask_openai(message, chat_messages)
        # response = "hey this is you medical assistant. Welcome to LLMbq medical assistant. I am here to help you."
        response_continue = response.split("\n")[0]
        response = "\n".join(response.split("\n")[1:]).strip()
        # Save the message and response
        chat = Chat(user=request.user, message=message, starttime=starttime,
                    response=response, created_at=timezone.now())
        chat.save()
        response_continue = response_continue.lower()
        print("here 2")
        # response_continue = "yes, chatgpt will continue"
        if "yes, chatgpt will continue" in response_continue:
            # added Timezone.now() to the context
            return JsonResponse({'starttime': str(starttime), 'message': message, 'response': response,'conversation':False})
        else:
            print("here 3")
            if "no, chatgpt will give summary" in response_continue:
                print("here 4")
                summary_message = "given the conversation above, please give a summary of the patient's health condition in the " \
                                  "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her " \
                                  "based on chat history, you can print summary in multi linguistic way, but please make sure the english version " \
                                  "appeared" \
                                  " don't be too long nor too short to end questioning," \
                                  " and remeber you need to ask question from specific to general " \
                                  " if you think the information is not enough,please type: 'yes, chatgpt will continue' " \
                                  " if you think the information is enough please type: 'no, chatgpt will give summary' please be cautious as possible"
                response = ask_openai(summary_message, chat_messages)
                # response = "summary testis asdfasdfafaasdfasdf \n asdfadsfadsfasdfadsf \n asdfasdf"
                chat = Chat(user=request.user, message=summary_message, starttime=starttime,
                            response=response, created_at=timezone.now())
                chat.save()
                response = response
                print("summary")
                user_id = request.user
                summary = Summary(user=user_id, summary=response, created_at=starttime)
                print("summary 2")
                summary.save()
                print("summary 3")
                return JsonResponse({'starttime': str(starttime), 'message': message, 'response': response, 'conversation': True})


            else:
                print("here 5")
                message_judge = " do you think based on the dialogue history it is enough to obtaine the health condition for cardiologist ?, "

                response_continue = ask_openai(message_judge, chat_messages+"\n"+response_continue+"\n"+response)
                if "yes, chatgpt will continue" in response_continue:
                    response = ask_openai("repeat your question, doctor?", chat_messages + "\n" + response_continue + "\n" + response)
                    # added Timezone.now() to the context
                    response = "\n".join(response.split("continue")[1:]).strip()
                    chat = Chat(user=request.user, message="repeat your question, doctor?", starttime=starttime,
                                response=response, created_at=timezone.now())
                    chat.save()
                    return JsonResponse({'starttime': str(starttime), 'message': message, 'response': response,'conversation':False})



                summary_message = "given the conversation above, please give a summary of the patient's health condition in the " \
                                  "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her " \
                                  "based on chat history, you can print summary in multi linguistic way, but please make sure the english version " \
                                  "must be included"
                response = ask_openai(summary_message, chat_messages)
                response = response.split("\n")[1:]
                response = "\n".join(response)+"\n"+"please type:'yes' or 'no' to indicate whether the summary is correct or not"
                prior_greeting = "You have finished the dialogue, and here is the summary of our conversation: \n"
                response = prior_greeting + response
                #response = "summary testis asdfasdfafaasdfasdf \n asdfadsfadsfasdfadsf \n asdfasdf"
                chat = Chat(user=request.user, message=summary_message, starttime=starttime,
                            response=response, created_at=timezone.now())
                chat.save()

                response = response
                return JsonResponse({'starttime':str(starttime),'message': message, 'response': response, 'conversation': True})
    def chatbot_view(self, username, data, request):
        # redirect to chatbot page
        context = {}

        context['message'] = data.get('message')
        starttime = data.get('starttime')
        context['starttime'] = data.get('starttime')
        first_message = data.get('message')
        #write to database

        first_history = "no previous history, this is the first message"
        response = ask_openai(first_message, first_history)
        #response = "wait for test"
        response = response.split("\n")[1:]
        response = "\n".join(response)
        chat = Chat(user=request.user, message=first_message, starttime=starttime,created_at=timezone.now(),response=response)
        chat.save()
        chats = []
        chats.append(first_message)

        chats.append(response)
        context['chats'] = Chat.objects.filter(user=request.user,starttime=starttime)
        # response context
        # create a http response
        # redirect to chatbot page
        #return redirect("chatbot")
        print("context is :", chats)
        # added Timezone.now() to the context
        return JsonResponse({'starttime': str(starttime), 'message': context['message'], 'response': response, 'conversation': False})


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

# Ask openai for response
def ask_openai(message,chats):
    messages = [
            {"role": "system", "content": "You are an helpful professional and neutral healthcare professional, and your job is"
                                          "to ask question to patient about their physical and mental condition and background history to provide clear summary."
                                          "The summary should be clear enough for healthcare professional to understand the patient's health condition."
                                          "The questions asked should contain two parts. The first part of questions should be in accordance with the format below and be related to the specefic body part the patient has complaints about. \
                                          First Part Question Format:  \
                                            Site: refers to the location of the complaint or discomfort	\
                                            Onset: when did the complaint start? \
                                            Character: how would the patient describe the complaint? (stabbing, dull, etc.) \
                                            Radiates: does the complaint radiate or spread to other areas of the body? \
                                            Associated Symptoms: Are there any other symptoms or sensations that are associated with the complaint? (sweating, nausea) \
                                            Time/duration: How long has the complaint been present? Is it constant or intermittent?  \
                                            Exacerbating: What makes the complaint worse? \
                                            Severity: on a scale from 0 to 10 how would the patient rate the severity of their pain or discomfort?'"
                                          "The main elements of the format is important, however you can still rephrase the questions"
                                          "The second part should be general questions in 5 categories (1. medical history and condition"
                                          "2. physical health and symptoms, 3. mental health and behavior, 4. social and personal information, and 5. sexual health and behavior): "
                                          "Ensure that every part of the SOCRATES pain assessment model is covered"
                                          "Ensure that all the 5 categories of general questions is covered"
                                          "if the patient does not give answer related to the question asked or you have not got the information the question inteded to gets, you need to ask the question again, in an empathetic way, before moving on to the next part"
                                          "Make sure that all the body parts that the patient has complaints about is covered"
                                          "Once you believe that you have collected enough information using the SOCRATES pain assessment model, you can move onto the second part"
                                          "Then, if you believe have collected enough information regarding 5 categories of the general questions, you can give a clear summary. "
                                          "Remember, you are a healthcare professional, and you need to be professional and neutral"
                                          "Be empathetic and respectful to the patient"
                                          "Try to ask about one body part at a time, and make sure that you have collected enough information before moving on to the next body part"
                                          "Be aware of the context. If a patient inputs pain in another body part in the middle of the conversation, confirm whether it was a mistake or not."
                                          "Ensure that you need to ask one question at a time (it is really important) and be careful to choose language you use"
                                          "and you have to end the dialogue with summary "
                                          },
            {"role":"assistant","content":"you give indication whether the dailogue will continue or not in the beginning in such way of any true response:"
                                          "if you think the dialogue will continue, add an indication: 'yes, chatgpt will continue \n' in the beginning"
                                           "if you think the dialogue don't need to be continued, add an indication: 'no, chatgpt will give summary \n' in the beginning"
                                           "no matter what content you type, what language you use, you need to add the indication in english in the beginning"
                                           "for example: 'yes, chatgpt will continue \n do you have a headache' or 'no, chatgpt will give summary \n here is the summary'"
                                           "please be cautious as possible, and remember to ask question one by one and collect enough information to give summary of "
                                           "the patient's health condition for cardiologist"},
            {"role":"assistant","content":"aftef ask question following socarates model, you need to keep ask general questions in 5 categoreis (1. medical history and condition"
                                          "2. physical health and symptoms, 3. mental health and behavior, 4. social and personal information, and 5. sexual health and behavior):"
                                          " "+general_questions},
            {"role":"assistant","content":"before you enter general question part give a specific report of socarate model and ask a general question in this format:"
                                          "'this is your summary from specific part, now we enter the general question part,......(follow a general question)'"},
            {"role":"assistant","content":"don't be easy to skip any of general questions, unless the patient has clearly claimed he/she donesn't have any symptoms or prolbmes "
                                          "in these areas"},
            {"role": "assistant","content":"here is previous conversation history:"+chats},
            {"role":"user","content":message},
            ]


    #messages.append({"role":"user","content":message})
    #print("messages are",messages)
    response = openai.ChatCompletion.create(
        model = "gpt-4",
        messages=messages
    )

    
    answer = response.choices[0].message.content.strip()
    return answer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt, name='dispatch')
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        if password1 == password2:
            try:
                user = User.objects.create_user(username, email, password1)
                user.save()
                return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
            except:
                return Response({'error_message': 'Error creating account'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error_message': 'Passwords donot match'}, status=status.HTTP_400_BAD_REQUEST)




def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})



class LastTenChatsView(generics.ListAPIView):
    serializer_class = ChatSerializer

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user=user).order_by('-created_at')[:10]

def upload_image(request):

    if request.method == 'POST':
        image = request.FILES.get('images')
        report = request.POST.get('report')
        user = request.user.username
        file = Report(user=user,report=report,images=image)
        file.save()
        return redirect('loginapi')
    return render(request,'add_user_image.html')
