'use client';

import { gql, useQuery } from '@apollo/client';

const DASHBOARD_QUERY = gql`
  query DashboardOverview {
    overdueInvoices {
      id
      dueDate
      amount
      client {
        name
      }
    }
    projects(status: "active") {
      id
      name
      deadline
    }
    tasks(completed: false) {
      id
      title
      dueDate
      project {
        name
      }
    }
    highRiskClients {
      id
      name
    }
  }
`;

export function DashboardOverview() {
  const { data, loading, error } = useQuery(DASHBOARD_QUERY);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading dashboard.</div>;
  }

  const overdueInvoices = data?.overdueInvoices ?? [];
  const activeProjects = data?.projects ?? [];
  const openTasks = data?.tasks ?? [];
  const highRiskClients = data?.highRiskClients ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Overdue invoices</div>
          <div className="mt-2 text-2xl font-bold">
            {overdueInvoices.length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Active projects</div>
          <div className="mt-2 text-2xl font-bold">
            {activeProjects.length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Open tasks</div>
          <div className="mt-2 text-2xl font-bold">{openTasks.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">High-risk clients</div>
          <div className="mt-2 text-2xl font-bold">
            {highRiskClients.length}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm font-medium">Overdue invoices</div>
          <ul className="space-y-1 text-sm">
            {overdueInvoices.map((inv: any) => (
              <li key={inv.id} className="flex justify-between">
                <span>{inv.client.name}</span>
                <span className="text-muted-foreground">
                  {inv.amount} due on {inv.dueDate}
                </span>
              </li>
            ))}
            {overdueInvoices.length === 0 && (
              <li className="text-muted-foreground">No overdue invoices 🎉</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm font-medium">Upcoming project deadlines</div>
          <ul className="space-y-1 text-sm">
            {activeProjects.map((p: any) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.deadline}</span>
              </li>
            ))}
            {activeProjects.length === 0 && (
              <li className="text-muted-foreground">No upcoming deadlines.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

