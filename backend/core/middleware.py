from typing import Callable

from django.http import HttpRequest, HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthMiddleware:
    """
    Simple middleware that authenticates requests using SimpleJWT and
    attaches the user to request.user so GraphQL resolvers can rely on it.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response
        self.auth = JWTAuthentication()

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # If already authenticated (e.g., admin), skip
        if not getattr(request, "user", None) or not request.user.is_authenticated:
            header = request.META.get("HTTP_AUTHORIZATION")
            if header and header.startswith("Bearer "):
                try:
                    user_auth_tuple = self.auth.authenticate(request)
                except Exception:
                    user_auth_tuple = None
                if user_auth_tuple is not None:
                    user, _ = user_auth_tuple
                    request.user = user

        response = self.get_response(request)
        return response

