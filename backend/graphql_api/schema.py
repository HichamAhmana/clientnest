import datetime
from typing import Optional

import graphene
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q, Sum
from graphene_django import DjangoObjectType

from clients.models import Client
from projects.models import Project
from tasks.models import Task
from invoices.models import Invoice


User = get_user_model()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class ClientType(DjangoObjectType):
    class Meta:
        model = Client
        fields = (
            "id",
            "name",
            "email",
            "company",
            "status",
            "notes",
            "archived",
            "created_at",
            "updated_at",
        )


class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "status",
            "budget_amount",
            "budget_currency",
            "deadline",
            "client",
            "created_at",
            "updated_at",
        )


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "priority",
            "due_date",
            "completed",
            "completed_at",
            "project",
            "created_at",
            "updated_at",
        )


class InvoiceType(DjangoObjectType):
    is_overdue = graphene.Boolean()

    class Meta:
        model = Invoice
        fields = (
            "id",
            "client",
            "project",
            "amount",
            "currency",
            "issue_date",
            "due_date",
            "status",
            "paid_at",
            "created_at",
            "updated_at",
        )

    def resolve_is_overdue(self, info):
        today = datetime.date.today()
        return self.status == Invoice.STATUS_UNPAID and self.due_date < today


class MonthlyIncomeSummary(graphene.ObjectType):
    month = graphene.Int()
    total = graphene.Float()


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)

    clients = graphene.List(ClientType, include_archived=graphene.Boolean(default_value=False))
    client = graphene.Field(ClientType, id=graphene.ID(required=True))

    projects = graphene.List(ProjectType, client_id=graphene.ID(), status=graphene.String())
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    tasks = graphene.List(TaskType, project_id=graphene.ID(), completed=graphene.Boolean())
    task = graphene.Field(TaskType, id=graphene.ID(required=True))

    invoices = graphene.List(InvoiceType, status=graphene.String())
    invoice = graphene.Field(InvoiceType, id=graphene.ID(required=True))

    overdue_invoices = graphene.List(InvoiceType)
    upcoming_deadlines = graphene.List(ProjectType)
    monthly_income_summary = graphene.List(
        MonthlyIncomeSummary, year=graphene.Int(required=True)
    )
    high_risk_clients = graphene.List(ClientType)

    def _get_user(self, info):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")
        return user

    def resolve_me(self, info):
        return self._get_user(info)

    def resolve_clients(self, info, include_archived=False):
        user = self._get_user(info)
        qs = Client.objects.filter(user=user)
        if not include_archived:
            qs = qs.filter(archived=False)
        return qs

    def resolve_client(self, info, id):
        user = self._get_user(info)
        return Client.objects.filter(user=user, id=id).first()

    def resolve_projects(self, info, client_id=None, status=None):
        user = self._get_user(info)
        qs = Project.objects.filter(user=user)
        if client_id is not None:
            qs = qs.filter(client_id=client_id)
        if status is not None:
            qs = qs.filter(status=status)
        return qs

    def resolve_project(self, info, id):
        user = self._get_user(info)
        return Project.objects.filter(user=user, id=id).first()

    def resolve_tasks(self, info, project_id=None, completed=None):
        user = self._get_user(info)
        qs = Task.objects.filter(user=user)
        if project_id is not None:
            qs = qs.filter(project_id=project_id)
        if completed is not None:
            qs = qs.filter(completed=completed)
        return qs

    def resolve_task(self, info, id):
        user = self._get_user(info)
        return Task.objects.filter(user=user, id=id).first()

    def resolve_invoices(self, info, status=None):
        user = self._get_user(info)
        qs = Invoice.objects.filter(user=user)
        if status is not None:
            qs = qs.filter(status=status)
        return qs

    def resolve_invoice(self, info, id):
        user = self._get_user(info)
        return Invoice.objects.filter(user=user, id=id).first()

    def resolve_overdue_invoices(self, info):
        user = self._get_user(info)
        today = datetime.date.today()
        return Invoice.objects.filter(
            user=user,
            status=Invoice.STATUS_UNPAID,
            due_date__lt=today,
        )

    def resolve_upcoming_deadlines(self, info):
        user = self._get_user(info)
        today = datetime.date.today()
        return Project.objects.filter(
            user=user,
            status__in=[Project.STATUS_PLANNED, Project.STATUS_ACTIVE],
            deadline__gte=today,
        ).order_by("deadline")[:20]

    def resolve_monthly_income_summary(self, info, year):
        user = self._get_user(info)
        paid_invoices = (
            Invoice.objects.filter(
                user=user,
                status=Invoice.STATUS_PAID,
                paid_at__year=year,
            )
            .annotate(month=F("paid_at__month"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        return [
            MonthlyIncomeSummary(month=row["month"], total=float(row["total"]))
            for row in paid_invoices
        ]

    def resolve_high_risk_clients(self, info):
        user = self._get_user(info)
        today = datetime.date.today()
        qs = (
            Client.objects.filter(user=user, archived=False)
            .annotate(
                total_invoices=Count("invoices"),
                overdue_invoices=Count(
                    "invoices",
                    filter=Q(
                        invoices__status=Invoice.STATUS_UNPAID,
                        invoices__due_date__lt=today,
                    ),
                ),
            )
            .filter(total_invoices__gt=0, overdue_invoices__gt=0)
            .order_by("-overdue_invoices")
        )
        return qs


class ClientInput(graphene.InputObjectType):
    id = graphene.ID()
    name = graphene.String(required=True)
    email = graphene.String()
    company = graphene.String()
    status = graphene.String()
    notes = graphene.String()


class ProjectInput(graphene.InputObjectType):
    id = graphene.ID()
    client_id = graphene.ID(required=True)
    name = graphene.String(required=True)
    status = graphene.String()
    budget_amount = graphene.Float()
    budget_currency = graphene.String()
    deadline = graphene.Date()


class TaskInput(graphene.InputObjectType):
    id = graphene.ID()
    project_id = graphene.ID(required=True)
    title = graphene.String(required=True)
    description = graphene.String()
    priority = graphene.String()
    due_date = graphene.Date()
    completed = graphene.Boolean()


class InvoiceInput(graphene.InputObjectType):
    id = graphene.ID()
    client_id = graphene.ID(required=True)
    project_id = graphene.ID(required=True)
    amount = graphene.Float(required=True)
    currency = graphene.String()
    issue_date = graphene.Date()
    due_date = graphene.Date(required=True)
    status = graphene.String()


class CreateOrUpdateClient(graphene.Mutation):
    client = graphene.Field(ClientType)

    class Arguments:
        input = ClientInput(required=True)

    def mutate(self, info, input: ClientInput):
        user = Query()._get_user(info)

        if input.id:
            client = Client.objects.filter(user=user, id=input.id).first()
            if not client:
                raise Exception("Client not found")
        else:
            client = Client(user=user)

        for field in ["name", "email", "company", "status", "notes"]:
            value: Optional[str] = getattr(input, field, None)
            if value is not None:
                setattr(client, field, value)

        client.save()
        return CreateOrUpdateClient(client=client)


class ArchiveClient(graphene.Mutation):
    client = graphene.Field(ClientType)

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        user = Query()._get_user(info)
        client = Client.objects.filter(user=user, id=id).first()
        if not client:
            raise Exception("Client not found")

        # Business rule: cannot archive client with active projects
        has_active_projects = client.projects.filter(
            status__in=[Project.STATUS_PLANNED, Project.STATUS_ACTIVE]
        ).exists()
        if has_active_projects:
            raise Exception("Cannot archive client with active projects")

        client.archived = True
        client.save(update_fields=["archived"])
        return ArchiveClient(client=client)


class CreateOrUpdateProject(graphene.Mutation):
    project = graphene.Field(ProjectType)

    class Arguments:
        input = ProjectInput(required=True)

    def mutate(self, info, input: ProjectInput):
        user = Query()._get_user(info)

        client = Client.objects.filter(user=user, id=input.client_id).first()
        if not client:
            raise Exception("Client not found")

        if input.id:
            project = Project.objects.filter(user=user, id=input.id).first()
            if not project:
                raise Exception("Project not found")
        else:
            project = Project(user=user, client=client)

        if project.status == Project.STATUS_COMPLETED and not input.id:
            raise Exception("Cannot create tasks on a completed project")

        for field in ["name", "status", "budget_currency", "deadline"]:
            value = getattr(input, field, None)
            if value is not None:
                setattr(project, field, value)

        if input.budget_amount is not None:
            project.budget_amount = input.budget_amount

        project.save()
        return CreateOrUpdateProject(project=project)


class CreateOrUpdateTask(graphene.Mutation):
    task = graphene.Field(TaskType)

    class Arguments:
        input = TaskInput(required=True)

    def mutate(self, info, input: TaskInput):
        user = Query()._get_user(info)

        project = Project.objects.filter(user=user, id=input.project_id).first()
        if not project:
            raise Exception("Project not found")

        # Business rule: completed projects cannot receive new tasks
        if project.status == Project.STATUS_COMPLETED and not input.id:
            raise Exception("Cannot add tasks to a completed project")

        if input.id:
            task = Task.objects.filter(user=user, id=input.id).first()
            if not task:
                raise Exception("Task not found")
        else:
            task = Task(user=user, project=project)

        for field in ["title", "description", "priority", "due_date", "completed"]:
            value = getattr(input, field, None)
            if value is not None:
                setattr(task, field, value)

        task.save()
        return CreateOrUpdateTask(task=task)


class ToggleTaskCompletion(graphene.Mutation):
    task = graphene.Field(TaskType)

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        user = Query()._get_user(info)
        task = Task.objects.filter(user=user, id=id).first()
        if not task:
            raise Exception("Task not found")

        task.completed = not task.completed
        if task.completed:
            task.completed_at = datetime.datetime.utcnow()
        else:
            task.completed_at = None
        task.save(update_fields=["completed", "completed_at"])
        return ToggleTaskCompletion(task=task)


class CreateOrUpdateInvoice(graphene.Mutation):
    invoice = graphene.Field(InvoiceType)

    class Arguments:
        input = InvoiceInput(required=True)

    def mutate(self, info, input: InvoiceInput):
        user = Query()._get_user(info)

        client = Client.objects.filter(user=user, id=input.client_id).first()
        if not client:
            raise Exception("Client not found")

        project = Project.objects.filter(user=user, id=input.project_id).first()
        if not project:
            raise Exception("Project not found")

        if input.id:
            invoice = Invoice.objects.filter(user=user, id=input.id).first()
            if not invoice:
                raise Exception("Invoice not found")
        else:
            invoice = Invoice(user=user, client=client, project=project)

        for field in ["amount", "currency", "issue_date", "due_date", "status"]:
            value = getattr(input, field, None)
            if value is not None:
                setattr(invoice, field, value)

        invoice.save()
        return CreateOrUpdateInvoice(invoice=invoice)


class MarkInvoicePaid(graphene.Mutation):
    invoice = graphene.Field(InvoiceType)

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        user = Query()._get_user(info)
        invoice = Invoice.objects.filter(user=user, id=id).first()
        if not invoice:
            raise Exception("Invoice not found")

        invoice.status = Invoice.STATUS_PAID
        invoice.paid_at = datetime.datetime.utcnow()
        invoice.save(update_fields=["status", "paid_at"])
        return MarkInvoicePaid(invoice=invoice)


class Mutation(graphene.ObjectType):
    create_or_update_client = CreateOrUpdateClient.Field()
    archive_client = ArchiveClient.Field()

    create_or_update_project = CreateOrUpdateProject.Field()

    create_or_update_task = CreateOrUpdateTask.Field()
    toggle_task_completion = ToggleTaskCompletion.Field()

    create_or_update_invoice = CreateOrUpdateInvoice.Field()
    mark_invoice_paid = MarkInvoicePaid.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)

