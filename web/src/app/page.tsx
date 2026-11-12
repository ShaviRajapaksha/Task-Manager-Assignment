import { TaskManager } from '@/components/task-manager';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Tasks</h1>
      <TaskManager />
    </main>
  );
}
