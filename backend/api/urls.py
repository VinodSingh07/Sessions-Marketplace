from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SessionViewSet, BookingViewSet, GoogleOAuthLoginView, 
    UserProfileView, CreateRazorpayOrderView, VerifyRazorpayPaymentView
)

router = DefaultRouter()
router.register(r'sessions', SessionViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('auth/google/', GoogleOAuthLoginView.as_view(), name='google-login'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('payment/order/<int:session_id>/', CreateRazorpayOrderView.as_view(), name='create-order'),
    path('payment/verify/', VerifyRazorpayPaymentView.as_view(), name='verify-payment'),
    path('', include(router.urls)),
]
