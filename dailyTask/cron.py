# Importaciones de la biblioteca estándar
import datetime

# Importaciones de bibliotecas de terceros
import pytz
from django_cron import CronJobBase, Schedule

# Importaciones locales
from .models import *

class MarkDelayedTasksCronJob(CronJobBase):
    RUN_AT_TIMES = ['19:00']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'dailyTask.MarkDelayedTasksCronJob'    # Código único

    def do(self):
        today = datetime.datetime.now().date()
        if not today.weekday() == 6:
            tasks = Tasks.objects.all()
            for task in tasks:
                if task.period == 'daily':
                    response = Response.objects.filter(task=task, created_at=today).first()

                    if not response:
                        response = Response()
                        response.completed = False
                        response.created_at = today
                        response.task = task
                        response.user = task.assigned_to
                        response.delayed = True
                        response.save()
                        response = response
                    elif response.completed == 0:
                        response.delayed = True
                        response.save()

                    try:
                        score = Score.objects.get(response_scoring=response)
                    except Score.DoesNotExist:
                        score = Score()
                        score.score = 1
                        score.scored_date = today
                        score.response_scoring = response
                        score.scored_by = Users.objects.get(id=1)
                        score.save()