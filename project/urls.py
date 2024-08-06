"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from dailyTask import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('response_pending_tasks/', views.response_pending_tasks, name='response_pending_tasks'),

    # Admin Views
    path('dashboard/', views.dashboard, name='dashboard'),
    path('manage_tasks/', views.manage_tasks, name='manage_tasks'),
    path('scoring_task/<str:username>/', views.scoring_task, name='scoring_task'),

    # Fetch
    path('change_state_task/', views.change_state_task, name='change_state_task'),
    path('filter_task/', views.filter_task, name='filter_task'),
    path('score_response/', views.score_response, name='score_response'),
    path('make_main_chart/', views.make_main_chart, name='make_main_chart'),

    # Auth
    path('login/', views.login_, name='login'),
    path('logout/', views.logout_, name='logout'),
]
