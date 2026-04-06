
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CartItemViewSet, add_to_cart, remove_from_cart

router = DefaultRouter()
router.register(r'cart-items', CartItemViewSet, basename='cart-items')

legacy_cartitem_list = CartItemViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
legacy_cartitem_detail = CartItemViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'put': 'update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', include(router.urls)),
    path('cartitems/', legacy_cartitem_list, name='legacy-cartitem-list'),
    path('cartitems/<int:pk>/', legacy_cartitem_detail, name='legacy-cartitem-detail'),
    path('add/', add_to_cart, name='cart-add'),
    path('remove/<int:item_id>/', remove_from_cart, name='cart-remove'),
]
