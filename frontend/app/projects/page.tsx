'use client';

import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';

const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id
      name
      status
      deadline
      client {
        name
      }
    }
  }
`;

const UPSERT_PROJECT_MUTATION = gql`
  mutation UpsertProject($input: ProjectInput!) {
    createOrUpdateProject(input: $input) {
      project {
        id
        name
        status
        deadline
        client {
          name
        }
      }
    }
  }
`;

const CLIENTS_QUERY = gql`
  query ProjectClients {
    clients {
      id
      name
    }
  }
`;

type ProjectFormValues = {
  name: string;
  clientId: string;
  deadline?: string;
};

export default function ProjectsPage() {
  const { data, loading, error, refetch } = useQuery(PROJECTS_QUERY);
  const { data: clientsData } = useQuery(CLIENTS_QUERY);
  const [upsertProject, { loading: saving }] = useMutation(
    UPSERT_PROJECT_MUTATION
  );
  const { register, handleSubmit, reset } = useForm<ProjectFormValues>();

  const onSubmit = async (values: ProjectFormValues) => {
    if (!values.clientId) return;
    await upsertProject({
      variables: {
        input: {
          name: values.name,
          clientId: values.clientId,
          status: 'active',
          deadline: values.deadline || null,
        },
      },
    });
    reset();
    refetch();
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-600">Error loading projects.</div>;

  const projects = data?.projects ?? [];
  const clients = clientsData?.clients ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap gap-2 rounded-lg border bg-card p-4 text-sm"
      >
        <input
          placeholder="Project name"
          className="min-w-[160px] flex-1 rounded-md border px-2 py-1.5"
          {...register('name', { required: true })}
        />
        <select
          className="min-w-[160px] rounded-md border px-2 py-1.5"
          defaultValue=""
          {...register('clientId', { required: true })}
        >
          <option value="" disabled>
            Select client
          </option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-md border px-2 py-1.5"
          {...register('deadline')}
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Add project'}
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-medium">Project</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project: any) => (
              <tr key={project.id} className="border-t">
                <td className="px-3 py-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {project.client?.name}
                </td>
                <td className="px-3 py-2 text-xs uppercase text-muted-foreground">
                  {project.status}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {project.deadline ?? '—'}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

