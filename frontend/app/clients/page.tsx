'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';

const CLIENTS_QUERY = gql`
  query Clients {
    clients {
      id
      name
      email
      company
      status
    }
  }
`;

const UPSERT_CLIENT_MUTATION = gql`
  mutation UpsertClient($input: ClientInput!) {
    createOrUpdateClient(input: $input) {
      client {
        id
        name
        email
        company
        status
      }
    }
  }
`;

type ClientFormValues = {
  name: string;
  email: string;
  company: string;
};

export default function ClientsPage() {
  const { data, loading, error, refetch } = useQuery(CLIENTS_QUERY);
  const [upsertClient, { loading: saving }] = useMutation(
    UPSERT_CLIENT_MUTATION
  );
  const { register, handleSubmit, reset } = useForm<ClientFormValues>();

  const onSubmit = async (values: ClientFormValues) => {
    await upsertClient({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          company: values.company,
          status: 'active',
        },
      },
    });
    reset();
    refetch();
  };

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div className="text-red-600">Error loading clients.</div>;

  const clients = data?.clients ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap gap-2 rounded-lg border bg-card p-4 text-sm"
      >
        <input
          placeholder="Client name"
          className="min-w-[160px] flex-1 rounded-md border px-2 py-1.5"
          {...register('name', { required: true })}
        />
        <input
          placeholder="Email"
          className="min-w-[160px] flex-1 rounded-md border px-2 py-1.5"
          {...register('email')}
        />
        <input
          placeholder="Company"
          className="min-w-[160px] flex-1 rounded-md border px-2 py-1.5"
          {...register('company')}
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Add client'}
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: any) => (
              <tr key={client.id} className="border-t">
                <td className="px-3 py-2">{client.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {client.email}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {client.company}
                </td>
                <td className="px-3 py-2 text-xs uppercase text-muted-foreground">
                  {client.status}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  No clients yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

