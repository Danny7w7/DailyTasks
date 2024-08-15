from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

PERIOD_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
]

# Create your models here.

class Users(AbstractUser):
    legend = models.TextField(null=True)

    def __str__(self):
        return f'{self.id} - {self.username}'
    
class Tasks(models.Model):
    title = models.CharField(max_length=60)
    created = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(Users, related_name='created_tasks', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(Users, related_name='assigned_tasks', on_delete=models.CASCADE)
    period = models.CharField(
        max_length=10,
        choices=PERIOD_CHOICES,
        default='daily',
    )
    is_active = models.BooleanField()
    activation_date = models.DateField(default=timezone.now)
    deactivation_date = models.DateField()

    def __str__(self):
        return f'{self.id} - {self.title} - Assigned to {self.assigned_to.username}'

class Response(models.Model):
    task = models.ForeignKey(Tasks, related_name='responses', on_delete=models.CASCADE)
    user = models.ForeignKey(Users, related_name='responses', on_delete=models.CASCADE)
    completed = models.BooleanField()
    response_text = models.TextField()
    created_at = models.DateField(auto_now_add=True)
    delayed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} - {self.task.title} to {self.user.username}"
    
class Score(models.Model):
    score = models.PositiveSmallIntegerField()
    scored_by = models.ForeignKey(Users, on_delete=models.CASCADE)
    response_scoring = models.OneToOneField(Response, on_delete=models.CASCADE)
    scored_date = models.DateField()
    admin_note = models.TextField(null=True)
    
    def __str__(self):
        return f'{self.id} - {self.score} - "{self.response_scoring.response_text}" to {self.response_scoring.task.title}'