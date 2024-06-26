import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
import openai
from .forms import ReportForm
from django.contrib import auth
from django.contrib.auth.models import User
from .models import Chat
import datetime
from django.http import HttpResponse
from django.utils import timezone
# import reverse
from django.urls import reverse
from django.conf import settings
from django.urls import reverse
BASE_DIR = str(settings.BASE_DIR)
open_ai_key_path = BASE_DIR+"/api_key.txt"

with open(open_ai_key_path, "r") as f:
    openai_api_key = f.read().strip()

openai.api_key = openai_api_key
from .models import Report
def ask_openai(message,chats):
    response = openai.ChatCompletion.create(
        model = "gpt-4",
        messages=[
            {"role": "system", "content": "You are an helpful professional and neutral cardiologist, and your job is"
                                          "to ask question to patient about their body condition to get the summary"
                                          " of their health condition to help human cardiologis for better diagonsis using Socrates Model."
                                          "you need to ask question according to the body part the patient selected first"
                                          "then, go to ask question in general, and once you ask enough question, you can"
                                          "you can give a summary of the patient's health condition. Remember, you are a real doctoc"
                                          "so, ask in human way, and be kind to patient and be professional. and you can ask"
                                          "remember that you need to ask one question each time and be careful to choose language you use"
                                          "and you have to end the dialogue with summary and give indication whether the dailogue will continue or not"
                                          "when we asked you whether the dialogue continue or not"},
            {"role": "assistant","content":"previous dialogues are: "+chats},
            {"role": "user", "content": message},
        ]
    )
    
    answer = response.choices[0].message.content.strip()
    return answer

# Create your views here.
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
        z.append(message)
        chat_messages = " \n ".join(z)
        response = ask_openai(message, chat_messages)
        #response = "test"
        chat = Chat(user=request.user, message=message, starttime=starttime,
                    response=response, created_at=timezone.now())
        chat.save()

        print("chat messages are",chat_messages)
        message_judge = " do you think based on the dialogue history it is enough to obtaine the health condition for cardiologist ?, " \
                        " don't be too long nor too short to end questioning," \
                        " and remeber you need to ask question from specific to general " \
                        " if you think the information is not enough,please type: 'yes, chatgpt will continue' " \
                        " if you think the information is enough please type: 'no, chatgpt will give summary' please be cautious as possible"


        response_continue = ask_openai(message_judge,chat_messages)
        #response_continue = "test"
        print("response continue is",response_continue)
        if "yes, chatgpt will continue" in response_continue:
            return JsonResponse({'message': message, 'response': response,'conversation':False})
        else:
            summary_message = "given the conversation above, please give a summary of the patient's health condition in the " \
                              "following format: 'the patient has a pain in his/her head, and he/she has a pain in his/her " \
                              "based on chat history, you can print summary in multi linguistic way, but please make sure the english version " \
                              "appeared"
            response = ask_openai(summary_message, chat_messages)
            #response = "summary testis asdfasdfafaasdfasdf \n asdfadsfadsfasdfadsf \n asdfasdf"
            chat = Chat(user=request.user, message=message, starttime=starttime,
                        response=response, created_at=timezone.now())
            chat.save()
            print("message is", message)
            response = response
            return JsonResponse({'starttime':str(starttime),'message': message, 'response': response, 'conversation': True})
    return render(request, 'chatbot.html', {'starttime':str(starttime),'chats': chats})


def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(request, username=username, password=password)
        if user is not None:
            auth.login(request, user)
            #return redirect('chatbot')
            return render(request,'select_body.html')
        else:
            error_message = 'Invalid username or password'
            return render(request, 'login.html', {'error_message': error_message})
    else:
        return render(request, 'login.html')

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

def logout(request):
    auth.logout(request)
    return redirect('login')


def upload_image(request):

    if request.method =="POST":
        image = request.FILES.get('images')
        user = request.user
        report = request.POST.get('report')
        file = Report(user=user,report=report,images=image)
        file.save()

        return redirect("login")  # Redirect to a page showing all reports
    return render(request,'add_user_image.html')
def chatbot_view(request,username):
    # redirect to chatbot page
    context = {}

    context['body_part'] = request.GET.get('body_part')
    starttime = datetime.datetime.now()
    context['starttime'] = str(datetime.datetime.now())
    first_message = "I have a complain in my " + context['body_part'] # i have complain in this part
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
    print("context is :", chats)
    return render(request,'chatbot.html',context)
