from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator 
from django.contrib import auth 
from .models import UserProfile
from .serializers import UserProfileSerializer

class GetUserProfileView(APIView):
    def get(self, request, format=None):
        try:
            user = self.request.user
            username = user.username 
            user_profile = UserProfile.objects.get(user=user)
            
            user_profile = UserProfileSerializer(user_profile)
            
            return Response({'profile': user_profile.data, 'username': str(username)})
        except:
            return Response({'error' : 'Something went wrong when retreving profile'})
    
class UpdateUserProfileView(APIView):
    def put(self, request, format=None):
        try:
            user = self.request.user
            username = user.username
            
            data = self.request.data
            first_name = data['first_name']
            last_name = data['last_name']
            phone = data['phone']
            email = data['email']
            note = data['note']
             
            UserProfile.objects.filter(user=user).update(first_name=first_name,last_name=last_name,phone=phone,email=email,note=note)
            
            user_profile = UserProfile.objects.get(user=user)
            user_profile = UserProfileSerializer(user_profile)
            
            return Response({'profile': user_profile.data, 'username': str(username)})
        except:
            return Response({'error' : 'Something went wrong when updating profile'})