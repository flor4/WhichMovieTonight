from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


# Serializer for reading user profile data
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff')
        read_only_fields = ('id', 'is_staff')


# Serializer for new user registration with password confirmation
class RegisterSerializer(serializers.ModelSerializer):
    # password2 is write-only and used only for confirmation
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')

    def validate(self, attrs):
        # Ensure both passwords match and the email is not already taken
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé."})

        return attrs

    def create(self, validated_data):
        # Remove the confirmation field before creating the user
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
