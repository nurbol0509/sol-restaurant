from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, label="Email")
    bio = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3, 'placeholder': 'Расскажите немного о себе...'}),
        required=False,
        label="О себе"
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'bio', 'password1', 'password2']