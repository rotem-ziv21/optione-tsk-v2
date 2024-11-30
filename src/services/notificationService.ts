import { Task } from '../types';

const N8N_WEBHOOK_URL = 'https://n8n-2-ghql.onrender.com/webhook-test/a7bfab6b-6acd-43ad-891d-0e2234102fc2';

export async function sendNotification(task: Task, type: string, email: string) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate
        },
        type,
        email,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification error:', error);
    // Don't throw error to prevent UI disruption
    return null;
  }
}