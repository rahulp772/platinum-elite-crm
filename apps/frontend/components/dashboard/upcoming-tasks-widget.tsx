"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Task {
    id: string
    title: string
    time: string
    priority: "high" | "medium" | "low"
    completed: boolean
}

const tasks: Task[] = [
    {
        id: "1",
        title: "Follow up with Sarah Johnson",
        time: "10:00 AM",
        priority: "high",
        completed: false,
    },
    {
        id: "2",
        title: "Schedule property viewing",
        time: "2:30 PM",
        priority: "medium",
        completed: false,
    },
    {
        id: "3",
        title: "Send contract to Michael Chen",
        time: "4:00 PM",
        priority: "high",
        completed: false,
    },
    {
        id: "4",
        title: "Update listing photos",
        time: "Tomorrow",
        priority: "low",
        completed: false,
    },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
}

export function UpcomingTasksWidget() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            variants={item}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors group"
                        >
                            <Checkbox id={task.id} />
                            <div className="flex-1 space-y-1">
                                <label
                                    htmlFor={task.id}
                                    className="text-sm font-medium leading-none cursor-pointer group-hover:text-realty-gold transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {task.title}
                                </label>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {task.time}
                                </div>
                            </div>
                            <Badge
                                variant={task.priority === "high" ? "destructive" : "secondary"}
                                className="text-xs"
                            >
                                {task.priority}
                            </Badge>
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </Card>
    )
}
