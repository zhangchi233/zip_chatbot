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
from .models import Report
import pandas as pd
import json
# from django.http import HttpResponse

BASE_DIR = str(settings.BASE_DIR)
open_ai_key_path = BASE_DIR+"/api_key.txt"
with open(open_ai_key_path, "r") as f:
    openai_api_key = f.read().strip()
openai.api_key = openai_api_key



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

        
        # Get the start time
        starttime = data.get('starttime')
        starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')
        
        # Fetch previous chat records for the user and the given start time
        chats = Chat.objects.filter(user=request.user, starttime__date=starttime.date(),
                                    starttime__hour=starttime.hour, starttime__minute=starttime.minute,
                                    starttime__second=starttime.second).order_by('created_at')

        if not chats.exists():

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
        # response_continue = "yes, chatgpt will continue"
        if "yes, chatgpt will continue" in response_continue:
            # added Timezone.now() to the context
            return JsonResponse({'starttime': str(starttime), 'message': message, 'response': response,'conversation':False})
        else:
            if "no, chatgpt will give summary" in response_continue:
                summary_message = "given the conversation above, please give a summary of the patient's health condition in the " \
                                  "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her " \
                                  "based on chat history, you can print summary in multi linguistic way, but please make sure the english version " \
                                  "appeared"
                response = ask_openai(summary_message, chat_messages)
                # response = "summary testis asdfasdfafaasdfasdf \n asdfadsfadsfasdfadsf \n asdfasdf"
                chat = Chat(user=request.user, message=summary_message, starttime=starttime,
                            response=response, created_at=timezone.now())
                chat.save()
                response = response
                summary = Summary(user=request.user, summary=response, created_at=starttime)
                summary.save()
                return JsonResponse({'starttime': str(starttime), 'message': message, 'response': response, 'conversation': True})


            else:
                message_judge = " do you think based on the dialogue history it is enough to obtaine the health condition for cardiologist ?, " \
                                " don't be too long nor too short to end questioning," \
                                " and remeber you need to ask question from specific to general " \
                                " if you think the information is not enough,please type: 'yes, chatgpt will continue' " \
                                " if you think the information is enough please type: 'no, chatgpt will give summary' please be cautious as possible"
                response_continue = ask_openai(message_judge, chat_messages+"\n"+response_continue+"\n"+response)
                if "yes, chatgpt will continue" in response_continue:
                    print("repeat")
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
                                  "appeared"
                response = ask_openai(summary_message, chat_messages)
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
        path_questionnaire = BASE_DIR + "/questionnaire.csv"
        dataframe = pd.read_csv(path_questionnaire,delimiter=";")
        dataframe = dataframe.dropna()
        # convert to json file and send to front end
        dataframe = dataframe.to_json(orient="records")

        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key,'qeustionnaire':dataframe})
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

# Ask openai for response
def ask_openai(message,chats):
    messages = [
            {"role": "system", "content": "You are an helpful professional and neutral cardiologist, and your job is"
                                          "to ask question to patient about their body condition to get the summary"
                                          " of their health condition to help human cardiologis for better diagonsis using Socrates Model."
                                          "you need to ask question according to the body part the patient selected first"
                                          "then, go to ask question in general, and once you ask enough question, you can"
                                          "you can give a summary of the patient's health condition. Remember, you are a real doctoc"
                                          "so, ask in human way, and be kind to patient and be professional. and you can ask"
                                          "remember that you need to ask one question each time and be careful to choose language you use"
                                          "and you have to end the dialogue with summary "
                                          },
            {"role":"assistant","content":"you give indication whether the dailogue will continue or not in the beginning in such way of any true response:"
                                          "if you think the dialogue will continue, add an indication: 'yes, chatgpt will continue \n' in the beginning"
                                           "if you think the dialogue don't need to be continued, add an indication: 'no, chatgpt will give summary \n' in the beginning"
                                           "no matter what content you type, what language you use, you need to add the indication in english in the beginning"
                                           "for example: 'yes, chatgpt will continue \n 请问你的眩晕持续多久了呢' or 'no, chatgpt will give summary \n 好的我了解你的情况了'"
                                           "please be cautious as possible, and remember to ask question one by one and collect enough information to give summary of "
                                           "the patient's health condition for cardiologist"},
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

@permission_classes([IsAuthenticated])
def upload_image(request):

    if request.method =="POST":


        image = request.FILES.get('images')

        report = request.POST.get('report')
        user = request.user.username
        file = Report(user=user,report=report,images=image)
        file.save()

        return redirect('loginapi')  # Redirect to a page showing all reports
    return render(request,'add_user_image.html')
