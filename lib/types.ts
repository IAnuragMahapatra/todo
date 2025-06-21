// Core types for the to-do application
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  progress?: number; // 0-100
  tag?: TaskTag;
  subTasks?: SubTask[];
  showSubTasks?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskTag {
  id: string;
  label: string;
  color: string;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: TaskItem[];
  collapsed?: boolean;
}

export interface TaskFilter {
  status: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface AppState {
  tasks: Task[];
  groups: TaskGroup[];
  filter: TaskFilter;
  darkMode: boolean;
}

// Predefined tags
export const DEFAULT_TAGS: TaskTag[] = [
  { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
];