from rest_framework import serializers
from .models import User, Session, Booking

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'role'] # Keep role read-only or allow change?

class SessionSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'description', 'price', 'date', 'duration_minutes', 'creator', 'creator_name', 'created_at']
        read_only_fields = ['id', 'creator', 'created_at']

class BookingSerializer(serializers.ModelSerializer):
    session_details = SessionSerializer(source='session', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'user', 'user_details', 'session', 'session_details', 'status', 'razorpay_order_id', 'razorpay_payment_id', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'razorpay_order_id', 'razorpay_payment_id', 'created_at']
