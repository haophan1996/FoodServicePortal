from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from user_profile.models import UserProfile
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.contrib import auth
from .serializers import UserSerialized
from django.views.decorators.csrf import ensure_csrf_cookie 
from django.conf import settings
from django.http import HttpResponseForbidden
 
class CheckAuthenticatedView(APIView): 
    def get(self, request, format=None):
        user = self.request.user
        try:
            isAuthenticated = user.is_authenticated
            
            if isAuthenticated:
                return Response({'isAuthenticated': 'success'})
            else:
                return Response({'isAuthenticated': 'error'})
        except:
            return Response({'error': 'Something went wrong when checking authentication status'})

@method_decorator(csrf_protect, name='dispatch')
class SignupView(APIView):
    permission_classes = (permissions.AllowAny, )
 
    def post(self, request, format=None):
        data = self.request.data    
        if (len(data) == 0):
            return Response ({'error': 'Username and Password must fill in'})
        
        username = data['username']
        password = data['password']
        if 're_password' not in data or len(data['re_password']) == 0:
            return Response ({'error': 're_password must fill in'})
        else: 
            re_password = data['re_password']
        try:
            if password == re_password: 
                    if User.objects.filter(username=username).exists():
                        return Response ({'error': 'Username already exists'})
                    else:
                        if len(password) < 6:
                            return Response({'error' : 'password must be at least 6 characters'})
                        else:
                            user = User.objects.create_user(username=username, password=password)  
                            
                            user = User.objects.get(id=user.id)
                            user_profile = UserProfile.objects.create(user=user, first_name = '', last_name='',phone='',email='',note='')
                             
                            return Response({'success' : 'User created successfully'})
            else:
                return Response({'error' : 'Password do not match'})
        except:
                return Response({'error' : 'Something went wrong when registering account'})

@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (permissions.AllowAny, )
    
    def post(self, request, format=None):
        data = self.request.data
        
        username = data['username']
        password = data['password'] 
        
        try:
            user = auth.authenticate(username=username,password=password)
             
            if user is not None:
                auth.login(request, user)
                return Response({'success' : 'User login success'})
            else:
                return Response({'error': 'Error Authenticating'})
        except:
            return Response({'error': 'Something went wrong when logging'})


class LogoutView(APIView):
    def post(self,request, format=None):
        try:
            auth.logout(request)
            return Response({'success': 'Logged out'})
        except:
            return Response({'error': 'Something went wrong when logging out'})

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny, )
    
    # @method_decorator(ensure_csrf_cookie)
    def get(self, request, format=None): 
        return Response({ 'success': 'CSRF cookie set' })

class DeleteAccountView(APIView):
    def delete(self,request, format=None):
        
        user = self.request.user
        
        try:
            
            user = User.objects.filter(id=user.id).delete()
            
            return Response({'success' : 'User deleted successfully'})
        except:
            return Response({'error': 'Something went wrong when delete user'})

class GetUsersView(APIView):
    permission_classes = (permissions.AllowAny, )
    
    def get(self, request, format=None):
        users = User.objects.all()
        
        users = UserSerialized(users, many=True)
        return Response(users.data)


class GetSupportExtractCookie(APIView):
    permission_classes = (permissions.AllowAny, )
    
    def get(self, request, format=None): 
        try:
            headers_origin = request.headers.get('Host')
            # print(headers_origin)
            # print(request.headers)
            # print(settings.CORS_ALLOWED_ORIGINS)
             
            if headers_origin not in "quinnportal-ed24dad413e2.herokuapp.com,127.0.0.1:8000,127.0.0.1:7000":
                print(headers_origin)
                return HttpResponseForbidden({"Forbidden": "GetSupportExtractCookie"}) 
            
            cookie_header = request.headers.get('Cookie')
            cookies = cookie_header.split('; ')
            csrftoken_cookie = next((cookie.split('=')[-1] for cookie in cookies if cookie.startswith('csrftoken=')), None)
             
            return Response({'success' : csrftoken_cookie})
        except:
            return Response({'error' : 'Could not found'})
            
