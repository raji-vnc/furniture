from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,    
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/products/', include('api.products.urls')),
    path('api/accounts/', include('api.accounts.urls')),
    path('api/cart/', include('api.cart.urls')),
    path('api/orders/', include('api.orders.urls')),
    path('api/coupons/', include('api.coupons.urls')),
    path('api/contacts/', include('api.contacts.urls')),
    path('api/blogs/', include('api.blog.urls')),
    path('api/testimonials/', include('api.testimonials.urls')),


    path('api/cart/', include('api.cart.urls')),
    

    ] 