'use server'

import { revalidatePath } from 'next/cache'
import { getAuthHeaders } from '@/lib/auth'

export interface CreateTaskInput {
  title: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  relatedToId?: string
  relatedToType?: string
  assignedToId?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
}

export async function createTask(data: CreateTaskInput) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tasks`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create task')
  }

  const task = await response.json()
  
  revalidatePath('/tasks')
  revalidatePath('/calendar')
  
  return task
}

export async function updateTask(data: UpdateTaskInput) {
  const { id, ...taskData } = data
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update task')
  }

  const task = await response.json()
  
  revalidatePath('/tasks')
  revalidatePath('/calendar')
  revalidatePath(`/tasks/${id}`)
  
  return task
}

export async function deleteTask(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tasks/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete task')
  }

  revalidatePath('/tasks')
  revalidatePath('/calendar')
}

export async function completeTask(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'done' }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to complete task')
  }

  const task = await response.json()
  
  revalidatePath('/tasks')
  revalidatePath('/calendar')
  
  return task
}

export async function assignTask(taskId: string, assignedToId: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignedToId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to assign task')
  }

  const task = await response.json()
  
  revalidatePath('/tasks')
  revalidatePath(`/tasks/${taskId}`)
  
  return task
}