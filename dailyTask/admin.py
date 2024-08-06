from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Users)
admin.site.register(Tasks)
admin.site.register(Response)
admin.site.register(Score)