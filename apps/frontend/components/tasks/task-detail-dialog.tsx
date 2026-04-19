"use client"

import * as React from "react"
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Trash2, Calendar, Clock, User } from "lucide-react"
import { Task, TaskPriority, TaskStatus } from "@/types/task"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const priorityColors: Record<TaskPriority, string> = {
  low: "text-blue-600 bg-blue-100",
  medium: "text-amber-600 bg-amber-100",
  high: "text-rose-600 bg-rose-100",
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [status, setStatus] = React.useState<TaskStatus>("todo")
  const [priority, setPriority] = React.useState<TaskPriority>("medium")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setPriority(task.priority)
      setIsEditing(false)
    }
  }, [task])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        title,
        description,
        status,
        priority,
      })
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to update task", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    setIsLoading(true)
    try {
      await deleteTask.mutateAsync(task.id)
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to delete task", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  const dueDate = new Date(task.dueDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : task.title}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update task details below" : "Task details and actions"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isEditing ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  {task.priority.toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.status === "done" ? "bg-green-100 text-green-700" :
                  task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {task.status === "in_progress" ? "IN PROGRESS" : task.status.toUpperCase()}
                </span>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{dueDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{task.assignedTo.name}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {!isEditing && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {(isLoading || updateTask.isPending || deleteTask.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Task
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}