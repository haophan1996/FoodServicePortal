from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
 
urlpatterns = [
    # path('admin/', admin.site.urls), 
    # path('', include('api.urls')), # Display this for rest
    
    path('api-auth/', include('rest_framework.urls')),
    path("accounts/", include('accounts.urls')),
    path("profile/", include('user_profile.urls')),
    path("api/v1/", include('businessSQL.urls'))
]   
urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'))] 