import os
import requests
import razorpay
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Session, Booking
from .serializers import UserSerializer, SessionSerializer, BookingSerializer

# Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', ''))
)

class GoogleOAuthLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        token = request.data.get('credential') # ID token from Google
        if not token:
            return Response({"error": "Credential not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify Token via Google API
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        if response.status_code != 200:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            
        user_info = response.json()
        email = user_info.get('email')
        if not email:
            return Response({"error": "Email not found in token"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get or Create User
        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', ''),
        })
        
        # Generate JWT Tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class IsCreatorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'creator'
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all().order_by('-created_at')
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'creator':
            # Creators see bookings for their sessions
            return Booking.objects.filter(session__creator=user).order_by('-created_at')
        return Booking.objects.filter(user=user).order_by('-created_at')


class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'booking'

    def post(self, request, session_id):
        try:
            session_obj = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Optional: check if already booked
        
        # Create Razorpay Order
        amount_in_paise = int(session_obj.price * 100)
        payment_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_sess_{session_id}_user_{request.user.id}"
        }
        
        try:
            order = razorpay_client.order.create(data=payment_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create Pending Booking
        booking = Booking.objects.create(
            user=request.user,
            session=session_obj,
            status='pending',
            razorpay_order_id=order['id']
        )
        
        return Response({
            'order_id': order['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'booking_id': booking.id
        })


class VerifyRazorpayPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        # Verify Signature
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_order_id': razorpay_order_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Invalid Signature'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update Booking Status
        try:
            booking = Booking.objects.get(razorpay_order_id=razorpay_order_id)
            booking.status = 'confirmed'
            booking.razorpay_payment_id = razorpay_payment_id
            booking.save()
            return Response({'status': 'Payment successful, booking confirmed'})
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found for order'}, status=status.HTTP_404_NOT_FOUND)
