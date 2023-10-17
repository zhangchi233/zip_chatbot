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
with open("/Users/asdfasd/django-chatbot/django_chatbot/api_key.txt", "r") as f:
    openai_api_key = f.read().strip()
openai.api_key = openai_api_key

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

# Create your views here.
def chatbot(request,username):
    print("get request--------------")
    chats = Chat.objects.filter(user=username)
    if request.method == 'POST':
        print("get post")
        message = request.POST.get('message')
        chat_messages = chats.values_list('message', flat=True)

        message_judge = "do you want to continue the conversation?, if yes, please type yes, chatgpt will continue," \
                        " if no, please type"\
                        "no, chatgpt will give summary" \
                        "and give a summary in the format of 'summary: your summary...'"
        response_continue = ask_openai(message_judge,chat_messages)
        if "yes, chatgpt will continue" in response_continue:
            response = ask_openai(message, chat_messages)

            chat = Chat(user=request.user, message=message, starttime=request.starttime,
                        response=response, created_at=timezone.now())
            chat.save()
            print("message is", message)
            response = response
            return JsonResponse({'message': message, 'response': response,'conversation':True})
        elif "no, chatgpt will give summary":
            response = response_continue.split("summary:")[1]
            chat = Chat(user=request.user, message=message, starttime=request.starttime,
                        response=response, created_at=timezone.now())
            chat.save()
            print("message is", message)
            response = response
            return JsonResponse({'message': message, 'response': response, 'conversation': True})
    return render(request, 'chatbot.html', {'chats': chats})


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
        form = ReportForm(request.POST, request.FILES)
        print(form.is_valid())
        if form.is_valid():

            report = form.save(commit=False)

            #report.user ="maxzhang"  # Assuming user authentication is in place
            report.save()
            return render(request,'add_user_image.html')  # Redirect to a page showing all reports
    return render(request,'add_user_image.html')
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