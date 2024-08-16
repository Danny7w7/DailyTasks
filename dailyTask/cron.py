# Importaciones de la biblioteca estándar
import datetime

# Importaciones de Django
from django.utils import timezone

# Importaciones de bibliotecas de terceros
import pytz
from django_cron import CronJobBase, Schedule

# Importaciones locales
from .models import *

class MarkDelayedTasksCronJob(CronJobBase):
    RUN_AT_TIMES = ['20:00']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'dailyTask.MarkDelayedTasksCronJob'    # Código único

    def do(self):
        today = timezone.now().date()
        if not today.weekday() == 6:
            tasks = Tasks.objects.all()
            for task in tasks:
                if task.period == 'daily':
                    response = Response.objects.filter(task=task, created_at=today, completed=0).first()

                    if not response:
                        response = Response()
                        response.completed = False
                        response.created_at = today
                        response.task = task
                        response.user = task.assigned_to
                        response.delayed = True
                        response.save()
                        response = response

                    try:
                        score = Score.objects.get(response_scoring=response)
                    except Score.DoesNotExist:
                        score = Score()
                        score.score = 1
                        score.scored_date = today
                        score.response_scoring = response
                        score.scored_by = Users.objects.get(id=1)
                        score.save()