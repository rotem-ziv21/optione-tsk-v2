// Add TimeEntry type
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  columnId: string;
  boardId: string;
  businessId: string;
  position: number;
  assignee?: string;
  labels?: string[];
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  timeEntries?: TimeEntry[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}