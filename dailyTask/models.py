from django.db import models
from django.contrib.auth.models import AbstractUser

PERIOD_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
]

# Create your models here.

class Users(AbstractUser):
    legend = models.TextField(null=True)

    def __str__(self):
        return self.username
    
class Tasks(models.Model):
    title = models.CharField(max_length=60)
    created = models.DateField(auto_now=True)
    created_by = models.ForeignKey(Users, related_name='created_tasks', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(Users, related_name='assigned_tasks', on_delete=models.CASCADE)
    period = models.CharField(
        max_length=10,
        choices=PERIOD_CHOICES,
        default='daily',
    )
    is_active = models.BooleanField()

class Response(models.Model):
    task = models.ForeignKey(Tasks, related_name='responses', on_delete=models.CASCADE)
    user = models.ForeignKey(Users, related_name='responses', on_delete=models.CASCADE)
    completed = models.BooleanField()
    response_text = models.TextField()
    created_at = models.DateField(auto_now_add=True)
    delayed = models.BooleanField(default=False)

    def __str__(self):
        return f"ID {self.id} Response {self.user.username} to {self.task.title}"
    
class Score(models.Model):
    score = models.PositiveSmallIntegerField()
    scored_by = models.ForeignKey(Users, on_delete=models.CASCADE)
    response_scoring = models.OneToOneField(Response, on_delete=models.CASCADE)
    scored_date = models.DateField()