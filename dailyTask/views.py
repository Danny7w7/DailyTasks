# Importaciones de la biblioteca estándar
import re
from datetime import datetime, time, timedelta, date


# Importaciones de Django
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

# Importaciones de bibliotecas de terceros
import pytz

# Importaciones locales
from .models import *

# Create your views here.

# Auth
def login_(request):
    if request.user.is_authenticated:
        return redirect(index)
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(index)
        else:
            msg = 'Wrong data, try again'
            return render(request, 'login.html', {'msg':msg})
    else:
        return render(request, 'login.html')
    
def logout_(request):
    logout(request)
    return redirect(index)




@login_required(login_url='/login')
def index(request):
    print(make_password('admin'))
    if request.user.is_superuser:
        return redirect(dashboard)
    today = timezone.now().astimezone(pytz.timezone('America/Bogota')).date()
    latest_responses = {}
    delayed_responses = {}

    if request.method == 'POST':
        data = request.POST
        for key, value in data.items():
            if re.match(r'^checkTask\d+$', key) or key == 'csrfmiddlewaretoken':
                continue

            # Verifica si el usuario ya respondió a la tarea hoy, si respondió edita la respuesta, si no crea una nueva.
            lastResponse = Response.objects.filter(user=request.user, task_id=extract_numbers(key)).order_by('-created_at').first()
            taskComp = Tasks.objects.get(id=extract_numbers(key))

            if lastResponse:
                created_at = lastResponse.created_at

                # Verifica si 'created_at' es un datetime o date y ajusta
                if isinstance(created_at, datetime):
                    created_at_datetime = created_at
                else:
                    # Si 'created_at' es una fecha, combínala con la hora actual
                    created_at_datetime = datetime.combine(created_at, time())

                created_at_bogota = created_at_datetime.astimezone(pytz.timezone('America/Bogota')).date()

                # Verifica si la respuesta fue creada hoy y si la tarea es diaria
                if created_at_bogota == today and taskComp.period == 'daily':
                    response = lastResponse
                elif is_in_current_week(created_at) and taskComp.period == 'weekly':
                    response = lastResponse
                else:
                    response = Response()
            else:
                response = Response()

            # Check if the value arrived empty so that neither Score nor response is created
            response.task = taskComp
            response.user = request.user
            response.completed = True if f'checkTask{extract_numbers(key)}' in request.POST else False
            response.response_text = request.POST[f'noteTask{extract_numbers(key)}']
            response.save()

            note = Score.objects.filter(response_scoring=response).first() or Score()
            note.score = 10 if response.completed else 1
            note.scored_by = Users.objects.get(id=1)
            note.response_scoring = response
            note.scored_date = datetime.today()
            note.save()

    tasks = Tasks.objects.filter(assigned_to_id=request.user, is_active=True)
    for task in tasks:
        # Filtra las respuestas de hoy para la tarea actual
        answer = Response.objects.filter(
            task=task,
            user=request.user
        ).order_by('-created_at').first()

        if answer:
            created_at = answer.created_at
            # Verifica si 'created_at' es un datetime o date y ajusta
            if isinstance(created_at, datetime):
                created_at_datetime = created_at
            else:
                created_at_datetime = datetime.combine(created_at, time())

            created_at_bogota = created_at_datetime.astimezone(pytz.timezone('America/Bogota')).date()

            # Añade el texto de la última respuesta de hoy al diccionario, o una cadena vacía si no existe
            if created_at_bogota == today and task.period == 'daily':
                latest_responses[task.id] = {
                    'response_text': answer.response_text,
                    'completed': answer.completed
                }
            elif is_in_current_week(created_at) and task.period == 'weekly':
                latest_responses[task.id] = {
                    'response_text': answer.response_text,
                    'completed': answer.completed
                }
            else:
                latest_responses[task.id] = {
                    'response_text': '',
                    'completed': False
                }
        else:
            latest_responses[task.id] = {
                'response_text': '',
                'completed': False
            }

    #get pending tasks
    for task in tasks:
        responses = Response.objects.filter(task=task, user=request.user)
        for response in responses:
            if response.delayed and not response.completed:
                delayed_responses[response.id] = {
                    'id': response.id,
                    'response_text': response.response_text,
                    'task_title':task.title,
                    'created_at': response.created_at,
                }

    if tasks:
        first_active_task = tasks.first().id
        last_active_task = tasks.last().id
    else:
        first_active_task = None
        last_active_task = None

    context = {
        'tasks': tasks,
        'latest_responses': latest_responses,
        'first_active_task': first_active_task,
        'last_active_task': last_active_task,
        'delayed_responses': delayed_responses
    }
    return render(request, 'index.html', context)

def response_pending_tasks(request):
    ids = request.POST.getlist('id')
    for id in ids:
        response = Response.objects.get(id=id)
        response.response_text = request.POST.get(f'noteResponse{id}') or ''
        response.completed = True if request.POST.get(f'checkResponse{id}') else False
        response.save()
        
    return redirect(index)

@login_required(login_url='/login')
def dashboard(request):
    if not request.user.is_staff:
        return redirect(index)
    context = {
        'users':Users.objects.filter(is_superuser=0)
    }
    return render(request, 'dashboard.html', context)

@login_required(login_url='/login')
def manage_tasks(request):
    if not request.user.is_staff:
        return redirect(index)
    if request.method == 'POST':
        task = Tasks()
        task.title = request.POST['task']
        task.created_by = request.user
        task.period = request.POST['period']
        task.is_active = True
        task.activation_date = datetime.today()
        task.deactivation_date = datetime(2999, 1, 1)
        task.assigned_to = Users.objects.get(id=request.POST['employee'])
        task.save()

    users = Users.objects.all()
    user_tasks = {}
    for user in users:
        user_tasks[user] = Tasks.objects.filter(assigned_to=user)
    
    context = {
        'users': users,
        'user_tasks': user_tasks
    }
    return render(request, 'manage_tasks.html', context)

@login_required(login_url='/login')
def scoring_task(request, username, period):
    if not request.user.is_staff:
        return redirect(index)
    if request.method == 'POST':
        return score_response(request, username, period)
    user = Users.objects.get(username=username)
    latest_responses = {}
    today = timezone.now().astimezone(pytz.timezone('America/Bogota')).date()  # Solo la fecha actual

    tasks = Tasks.objects.filter(assigned_to_id=user, is_active=True)
    for task in tasks:
        score = None
        admin_note = None
        # Filtra las respuestas de hoy para la tarea actual
        answer = Response.objects.filter(
            task=task,
            user=user
        ).order_by('-created_at').first()

        if answer:
            created_at = answer.created_at

            # Convierte 'created_at' a datetime.datetime para las comparaciones
            created_at_datetime = datetime.combine(created_at, time.min)
            created_at_bogota = created_at_datetime.astimezone(pytz.timezone('America/Bogota')).date()

            # Añade el texto de la última respuesta de hoy al diccionario, o una cadena vacía si no existe
            if created_at_bogota == today and task.period == 'daily':
                try:
                    score_obj = Score.objects.get(response_scoring=answer, scored_date=today)
                    score = score_obj.score
                    admin_note = score_obj.admin_note
                except Score.DoesNotExist:
                    pass

                latest_responses[task.id] = {
                    'response_text': answer.response_text,
                    'completed': answer.completed,
                    'score': score,
                    'admin_note':admin_note
                }
            elif task.period == 'weekly':
                try:
                    score_obj = Score.objects.get(response_scoring=answer, scored_date=today)
                    score = score_obj.score
                    admin_note = score_obj.admin_note
                except Score.DoesNotExist:
                    pass
                latest_responses[task.id] = {
                    'response_text': answer.response_text,
                    'completed': answer.completed,
                    'score': score,
                    'admin_note': admin_note
                }
            else:
                latest_responses[task.id] = {
                    'response_text': '',
                    'completed': False,
                    'score': score,
                    'admin_note': admin_note
                }
        else:
            latest_responses[task.id] = {
                'response_text': '',
                'completed': False,
                'score': score,
                'admin_note': admin_note
            }
            
    daily_tasks = tasks.filter(period='daily')
    if daily_tasks:
        first_active_task_daily = daily_tasks.first().id
        last_active_task_daily = daily_tasks.last().id
    else:
        first_active_task_daily = None
        last_active_task_daily = None

    # Tareas semanales
    weekly_tasks = tasks.filter(period='weekly')
    if weekly_tasks:
        first_active_task_weekly = weekly_tasks.first().id
        last_active_task_weekly = weekly_tasks.last().id
    else:
        first_active_task_weekly = None
        last_active_task_weekly = None

    context = {
        'user_rated': user,
        'tasks': tasks,
        'latest_responses': latest_responses,
        'first_active_task_daily': first_active_task_daily,
        'last_active_task_daily': last_active_task_daily,
        'first_active_task_weekly': first_active_task_weekly,
        'last_active_task_weekly': last_active_task_weekly,
        'period': period
    }
    return render(request, 'scoringTask.html', context)

# Fetch JS
@csrf_exempt
def change_state_task(request):
    task = Tasks.objects.get(id=extract_numbers(request.POST['id']))
    task.is_active = request.POST['checked']
    
    if request.POST['checked'] == 'True':
        task.activation_date = datetime.today()
        task.deactivation_date = datetime(2999, 1, 1)
    else:
        task.deactivation_date = datetime.today()

    task.save()
    return JsonResponse({"message": "ok"})

@csrf_exempt
def filter_task(request):
    period = request.POST['period']
    user = Users.objects.get(username=request.POST['username'])

    if period == 'daily':
        formatted_date = datetime.strptime(request.POST['date'], '%Y-%m-%d').date()
        start_datetime = timezone.make_aware(datetime.combine(formatted_date, time.min))
        end_datetime = timezone.make_aware(datetime.combine(formatted_date, time.max))
    else:
        input_date = timezone.make_aware(datetime.strptime(request.POST['date'], '%Y-%m-%d'))
        start_date, end_date = get_current_week_range(input_date)
        start_datetime = timezone.make_aware(datetime.combine(start_date, time.min))
        end_datetime = timezone.make_aware(datetime.combine(end_date, time.max))

    filtered_responses = Response.objects.filter(
        created_at__range=(start_datetime, end_datetime),
        task__period=period,  # Filtra las respuestas asociadas a tareas con periodo 'daily'
        user=user
    )
    
    tasks_with_responses = {}
    for response in filtered_responses:
        # Obtén el score asociado a la respuesta, si existe
        try:
            score_value = response.score.score
            adminNote = response.score.admin_note
        except Score.DoesNotExist:
            score_value = None
            adminNote = None

        if response.task.id not in tasks_with_responses:
            tasks_with_responses[response.task.id] = {
                "title": response.task.title,
                "response": []
            }

        tasks_with_responses[response.task.id]["response"].append({
            "response_id": response.id,
            "completed": response.completed,
            "response_text": response.response_text,
            "user": response.user.username,
            "created_at": response.created_at,
            "score": score_value,
            "admin_Note":adminNote
        })

    response_data = {
        "message": "ok",
        "period": period,
        "data": tasks_with_responses
    }

    return JsonResponse(response_data)

def score_response(request, username, period):
    if request.POST.get('dateDaily'):
        datecomp = datetime.strptime(request.POST['dateDaily'], '%Y-%m-%d').date()
    elif request.POST.get('dateWeekly'):
        datecomp = datetime.strptime(request.POST['dateWeekly'], '%Y-%m-%d').date()
        start_date, end_date = get_current_week_range(datecomp)
        start_datetime = timezone.make_aware(datetime.combine(start_date, time.min))
        end_datetime = timezone.make_aware(datetime.combine(end_date, time.max))

    for key, value in request.POST.items():
        if re.match(r'^checkTask\d+$', key) or key == 'csrfmiddlewaretoken' or key == 'dateDaily' or key == 'dateWeekly':
            continue
        task = Tasks.objects.get(id=extract_numbers(key))
        if request.POST.get('dateDaily'):
            response = Response.objects.filter(task_id=extract_numbers(key), created_at=datecomp).last()
        elif request.POST.get('dateWeekly'):
            response = Response.objects.filter(task_id=extract_numbers(key), created_at__range=(start_datetime, end_datetime)).last()

        if not response:
            # Si no existe o no es de hoy, crear una nueva respuesta
            response = Response.objects.create(
                task=task,
                user=task.assigned_to,
                completed=False,
            )
        note = Score.objects.filter(response_scoring=response).first() or Score()
        note.score = request.POST[f'score{extract_numbers(key)}']
        note.admin_note = request.POST[f'noteAdmin{extract_numbers(key)}']
        note.scored_by = request.user
        note.response_scoring = response
        note.scored_date = datecomp
        if note.score:
            note.save()

    return redirect(scoring_task, period, username)

@csrf_exempt
def make_main_chart(request):
    users = Users.objects.filter(is_superuser=0)
    users_list = list(users.values('id', 'username'))

    responses = {}
    start_datetime, end_datetime = get_current_week_range()

    daily_tasks = Tasks.objects.filter(period='daily')
    tasks_list = list(daily_tasks.values('id', 'assigned_to_id', 'created', 'activation_date', 'deactivation_date'))
    responses_for_daily_tasks = Response.objects.filter(task__in=daily_tasks, created_at__range=(start_datetime, end_datetime))

    scores = {score.response_scoring_id: score.score for score in Score.objects.filter(response_scoring__in=responses_for_daily_tasks)}

    for response in responses_for_daily_tasks:
        responses[response.id] = {
            'day':response.created_at.weekday(),
            'tasks':tasks_list,
            'completed':response.completed,
            'user_id':response.user_id,
            'score': scores.get(response.id, None)
        }

    
    return JsonResponse({
        'users':users_list,
        'tasks':tasks_list,
        'tasks_count':daily_tasks.count(), 
        'responses':responses
        })

# Utils function
def extract_numbers(string):
    # Initialize an empty string to store the extracted numbers
    extracted_numbers = ""

    # Iterate through each character in the string
    for char in string:
        # Check if the character is a digit (0-9)
        if char.isdigit():
            # Append the digit to the extracted_numbers string
            extracted_numbers += char

    # Return the extracted numeric string
    return extracted_numbers

def get_current_week_range(time=None):
    if time is None:
        today = timezone.now().date()
    else:
        today = time.date() if isinstance(time, datetime) else time
    week_start = today - timedelta(days=today.weekday())  # Monday of this week
    week_end = week_start + timedelta(days=6)  # Sunday of this week
    return week_start, week_end

def is_in_current_week(date):
    week_start, week_end = get_current_week_range()
    date = date.date() if isinstance(date, datetime) else date
    return week_start <= date <= week_end