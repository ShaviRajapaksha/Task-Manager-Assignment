'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api, type Task, type TaskInput, type TaskStatus } from '@/lib/api';
import { DeleteTaskDialog } from './delete-task-dialog';
import { STATUS_LABELS } from './status-badge';
import { TaskFormDialog } from './task-form-dialog';
import { TaskTable } from './task-table';

type StatusFilter = TaskStatus | 'ALL';
type SortOrder = 'created' | 'dueAsc';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortOrder>('created');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTasks(await api.list());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleTasks = useMemo(() => {
    const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);
    if (sort === 'created') return filtered; // API already returns newest first
    // Earliest due date first; tasks without a due date go last.
    return [...filtered].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, filter, sort]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(input: TaskInput) {
    if (editing) {
      await api.update(editing.id, input);
      toast.success('Task updated');
    } else {
      await api.create(input);
      toast.success('Task created');
    }
    await load();
  }

  async function handleDelete(task: Task) {
    setDeleting(null);
    try {
      await api.remove(task.id);
      toast.success('Task deleted');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the task.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
            <SelectTrigger className="w-44" aria-label="Sort tasks">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Newest first</SelectItem>
              <SelectItem value="dueAsc">Due date (soonest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="rounded-lg border">
        {loading ? (
          <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading tasks">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center" role="alert">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button variant="outline" size="sm" onClick={load}>
              Try again
            </Button>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="font-medium">{tasks.length === 0 ? 'No tasks yet' : 'No tasks match this filter'}</p>
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0 ? 'Create your first task to get started.' : 'Try a different status.'}
            </p>
            {tasks.length === 0 && <Button onClick={openCreate}>New task</Button>}
          </div>
        ) : (
          <TaskTable tasks={visibleTasks} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <TaskFormDialog open={formOpen} task={editing} onOpenChange={setFormOpen} onSubmit={handleSubmit} />
      <DeleteTaskDialog task={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
}
