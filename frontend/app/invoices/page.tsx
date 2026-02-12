'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

const INVOICES_QUERY = gql`
  query Invoices($status: String) {
    invoices(status: $status) {
      id
      amount
      currency
      dueDate
      status
      client {
        name
      }
      project {
        name
      }
    }
  }
`;

const MARK_PAID_MUTATION = gql`
  mutation MarkInvoicePaid($id: ID!) {
    markInvoicePaid(id: $id) {
      invoice {
        id
        status
        paidAt
      }
    }
  }
`;

const STATUSES = ['unpaid', 'paid', 'overdue'] as const;

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(INVOICES_QUERY, {
    variables: { status: statusFilter },
  });
  const [markPaid] = useMutation(MARK_PAID_MUTATION);

  const invoices = data?.invoices ?? [];

  const onMarkPaid = async (id: string) => {
    await markPaid({ variables: { id } });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Filter by status:</span>
        <button
          type="button"
          className={`rounded-md border px-3 py-1.5 ${
            statusFilter === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-foreground'
          }`}
          onClick={() => setStatusFilter(null)}
        >
          All
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`rounded-md border px-3 py-1.5 capitalize ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground'
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading && <div>Loading invoices...</div>}
      {error && (
        <div className="text-red-600">Error loading invoices: {String(error)}</div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Project</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Due date</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-t">
                <td className="px-3 py-2">{inv.client?.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {inv.project?.name}
                </td>
                <td className="px-3 py-2">
                  {inv.amount} {inv.currency}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {inv.dueDate}
                </td>
                <td className="px-3 py-2 text-xs uppercase text-muted-foreground">
                  {inv.status}
                </td>
                <td className="px-3 py-2 text-right">
                  {inv.status !== 'paid' && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => onMarkPaid(inv.id)}
                    >
                      Mark as paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

