from django.urls import path
from accounts.views import signup,signin,home


app_name='accounts'

urlpatterns=[
    path('signup/',signup,name='signup'),
    path('signin/',signin,name='signin'),
    path('home/',home,name='home')
]