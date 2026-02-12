'use client';

import { useParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';

const PROJECT_DETAIL_QUERY = gql`
  query ProjectDetail($id: ID!) {
    project(id: $id) {
      id
      name
      status
      deadline
      client {
        name
      }
    }
    tasks(projectId: $id) {
      id
      title
      dueDate
      priority
      completed
    }
  }
`;

const UPSERT_TASK_MUTATION = gql`
  mutation UpsertTask($input: TaskInput!) {
    createOrUpdateTask(input: $input) {
      task {
        id
        title
        dueDate
        priority
        completed
      }
    }
  }
`;

const TOGGLE_TASK_MUTATION = gql`
  mutation ToggleTask($id: ID!) {
    toggleTaskCompletion(id: $id) {
      task {
        id
        completed
      }
    }
  }
`;

type TaskFormValues = {
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, loading, error, refetch } = useQuery(PROJECT_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
  });

  const [upsertTask, { loading: savingTask }] = useMutation(
    UPSERT_TASK_MUTATION
  );
  const [toggleTask] = useMutation(TOGGLE_TASK_MUTATION);

  const { register, handleSubmit, reset } = useForm<TaskFormValues>({
    defaultValues: { priority: 'medium' },
  });

  const onSubmit = async (values: TaskFormValues) => {
    await upsertTask({
      variables: {
        input: {
          projectId: id,
          title: values.title,
          priority: values.priority,
          dueDate: values.dueDate || null,
        },
      },
    });
    reset({ title: '', dueDate: '', priority: 'medium' });
    refetch();
  };

  const onToggleTask = async (taskId: string) => {
    await toggleTask({ variables: { id: taskId } });
    refetch();
  };

  if (!id) return <div>Missing project id.</div>;
  if (loading) return <div>Loading project...</div>;
  if (error) return <div className="text-red-600">Error loading project.</div>;

  const project = data?.project;
  const tasks = data?.tasks ?? [];

  if (!project) return <div>Project not found.</div>;

  const isCompleted = project.status === 'completed';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {project.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {project.client?.name} • Status: {project.status} • Deadline:{' '}
          {project.deadline ?? '—'}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Tasks</h2>
          {isCompleted && (
            <span className="text-xs uppercase text-muted-foreground">
              Completed projects cannot receive new tasks
            </span>
          )}
        </div>
        {!isCompleted && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-4 flex flex-wrap gap-2 text-sm"
          >
            <input
              placeholder="Task title"
              className="min-w-[160px] flex-1 rounded-md border px-2 py-1.5"
              {...register('title', { required: true })}
            />
            <select
              className="rounded-md border px-2 py-1.5"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              className="rounded-md border px-2 py-1.5"
              {...register('dueDate')}
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={savingTask}
            >
              {savingTask ? 'Saving...' : 'Add task'}
            </button>
          </form>
        )}
        <ul className="space-y-1 text-sm">
          {tasks.map((task: any) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-md border px-3 py-1.5"
            >
              <div>
                <div
                  className={
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }
                >
                  {task.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Priority: {task.priority} • Due:{' '}
                  {task.dueDate ? task.dueDate : '—'}
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => onToggleTask(task.id)}
              >
                {task.completed ? 'Mark as open' : 'Mark as done'}
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-muted-foreground">No tasks yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

