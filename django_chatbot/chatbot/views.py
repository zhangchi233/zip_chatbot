import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
import openai
from .forms import ReportForm
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Chat
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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from rest_framework.permissions import AllowAny



# from django.http import HttpResponse

from django.utils import timezone
# import reverse
from django.urls import reverse
PATH = "C:/Users/ssaba/OneDrive - Delft University of Technology/JIP/zip_chatbot/django_chatbot/api_key.txt"
with open(PATH, "r") as f:
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
        
        # Get the start time
        starttime = data.get('starttime')
        starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')
        
        # Fetch previous chat records for the user and the given start time
        chats = Chat.objects.filter(user=request.user, starttime__date=starttime.date(),
                                    starttime__hour=starttime.hour, starttime__minute=starttime.minute,
                                    starttime__second=starttime.second).order_by('created_at')
        if not chats.exists():
            body_part = data.get('body_part', 'unspecified body part')
            message = "I have a pain in my " + body_part
            response = ask_openai(message, "there is no previous message, but remember to ask question one by one")
            # response = "Everyone has pain in life, we can share our pain together"
            chat = Chat(user=request.user, message=message, starttime=starttime, created_at=timezone.now(), response=response)
            chat.save()
            return JsonResponse({'message': message, 'response': response, 'conversation': False})
        # Prepare the previous dialogues for context
        z = []
        for chat in chats:
            z.append(chat.message)
            z.append(chat.response)
        chat_messages = " \n ".join(z)

        # Get a response from OpenAI
        response = ask_openai(message, chat_messages)
        # response = "hey this is you medical assistant. Welcome to LLMbq medical assistant. I am here to help you."
        
        # Save the message and response
        chat = Chat(user=request.user, message=message, starttime=starttime,
                    response=response, created_at=timezone.now())
        chat.save()
        
        message_judge = ("do you think based on the dialogue history it is enough to obtain the"
                        "health condition ?, if yes, please type: 'yes, chatgpt will continue',"
                        " if no, please type: 'no, chatgpt will give summary'")
        response_continue = ask_openai(message_judge, chat_messages)
        # response_continue = "yes, chatgpt will continue"
        if "yes, chatgpt will continue" in response_continue:
            return JsonResponse({'message': message, 'response': response,'conversation':False})
        else:
            summary_message = ("given the conversation above, please give a summary of the patient's health condition in the "
                            "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her ")
            response = ask_openai(summary_message, chat_messages)
            # response = "hey this is you medical assistant. Welcome to LLMbq medical assistant. I am here to help you."

            # Save the summary response
            chat = Chat(user=request.user, message=message, starttime=starttime,
                        response=response, created_at=timezone.now())
            chat.save()

            return JsonResponse({'message': message, 'response': response, 'conversation': True})


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
    response = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an helpful professional and neutral cardiologist, and your job is"
                                          "to ask question to patient about their body condition to get the summary"
                                          " of their health condition to help human cardiologis for better diagonsis."
                                          "you need to ask question according to the body part the patient selected first"
                                          "then, go to ask question in general, and once you ask enough question, you can"
                                          "you can give a summary of the patient's health condition. Remember, you are a real doctoc"
                                          "so, ask in human way, and be kind to patient and be professional. ask question one by one"},
            {"role": "assistant","content":"previous dialogues are: "+chats},
            {"role": "user", "content": message},
        ]
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



def register(request):
    if request.method == 'GET':
        print("get")
        print(request.GET.get('context'))
        return render(request, 'register.html')
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        if password1 == password2:
            try:
                user = User.objects.create_user(username, email, password1)
                user.save()
                auth.login(request, user)



                return redirect('chatbot')
            except:
                error_message = 'Error creating account'
                return render(request, 'register.html', {'error_message': error_message})
        else:
            error_message = 'Password dont match'
            return render(request, 'register.html', {'error_message': error_message})
    return render(request, 'register.html')

def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})



def chatbot_view(request,username):
    # redirect to chatbot page
    context = {}

    context['body_part'] = request.GET.get('body_part')
    starttime = datetime.datetime.now()
    context['starttime'] = str(datetime.datetime.now())
    first_message = "I have a pain in my " + context['body_part']
    #write to database
    print("first message is",first_message)
    response = ask_openai(first_message, "there is no previous message,"
                                         "but remember to ask question one by one")
    #response = "wait for test"
    print(response)
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
    return render(request,'chatbot.html',context)

class LastTenChatsView(generics.ListAPIView):
    serializer_class = ChatSerializer

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user=user).order_by('-created_at')[:10]


def upload_image(request):

    if request.method =="POST":
        form = ReportForm(request.POST, request.FILES)
        print(form.is_valid())
        if form.is_valid():

            report = form.save(commit=False)

            #report.user ="maxzhang"  # Assuming user authentication is in place
            report.save()
            return render(request,'add_user_image.html')  # Redirect to a page showing all reports
    return render(request,'add_user_image.html')
def chatbot(request,username):

    starttime = request.GET.get('starttime')

    starttime = datetime.datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S.%f')

    chats = Chat.objects.filter(user=request.user,starttime__date=starttime.date(),
                                starttime__hour=starttime.hour,starttime__minute=starttime.minute,
                                starttime__second=starttime.second)


    if request.method == 'POST':

        message = request.POST.get('message')
        chats = chats.order_by('created_at')
        z = []
        for chat in chats:
            z.append(chat.message)
            z.append(chat.response)
        chat_messages = " \n ".join(z)
        response = ask_openai(message, chat_messages)

        chat = Chat(user=request.user, message=message, starttime=starttime,
                    response=response, created_at=timezone.now())
        chat.save()

        print("chat messages are",chat_messages)
        message_judge = "do you think based on the dialogue history it is enough to obtaine the" \
                        "health condition ?, if yes, please type: 'yes, chatgpt will continue'," \
                        " if no, please type: 'no, chatgpt will give summary' "

        response_continue = ask_openai(message_judge,chat_messages)
        print("response continue is",response_continue)
        if "yes, chatgpt will continue" in response_continue:
            return JsonResponse({'message': message, 'response': response,'conversation':False})
        if True:
            summary_message = "given the conversation above, please give a summary of the patient's health condition in the " \
                              "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her "
            response = ask_openai(summary_message, chat_messages)
            chat = Chat(user=request.user, message=message, starttime=starttime,
                        response=response, created_at=timezone.now())
            chat.save()
            print("message is", message)
            response = response
            return JsonResponse({'message': message, 'response': response, 'conversation': True})
    return render(request, 'chatbot.html', {'chats': chats})