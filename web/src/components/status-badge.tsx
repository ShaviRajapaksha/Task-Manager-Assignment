import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/lib/api';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const VARIANTS: Record<TaskStatus, 'secondary' | 'warning' | 'success'> = {
  TODO: 'secondary',
  IN_PROGRESS: 'warning',
  DONE: 'success',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
