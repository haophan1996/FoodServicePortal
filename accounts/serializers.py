from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerialized(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username')