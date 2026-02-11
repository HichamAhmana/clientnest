from django.db import models

from core.models import OwnedModel
from clients.models import Client


class Project(OwnedModel):
    STATUS_PLANNED = "planned"
    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = [
        (STATUS_PLANNED, "Planned"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_COMPLETED, "Completed"),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PLANNED,
    )
    budget_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    budget_currency = models.CharField(max_length=3, default="USD")
    deadline = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["deadline", "name"]

    def __str__(self) -> str:
        return self.name

