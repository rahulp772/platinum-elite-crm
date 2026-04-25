"use client"

import * as React from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { useLeads, useUpdateLead } from "@/hooks/use-leads"
import { Loader2, AlertCircle } from "lucide-react"
import { LeadStatus } from "@/types/lead"
import { LeadPipelineColumn } from "./lead-pipeline-column"
import { LeadPipelineCard } from "./lead-pipeline-card"

const PIPELINE_STAGES: { id: LeadStatus; title: string; color: string }[] = [
    { id: "new", title: "New", color: "bg-realty-navy/10 border-realty-navy/20" },
    { id: "contacted", title: "Contacted", color: "bg-indigo-500/10 border-indigo-500/20" },
    { id: "qualified", title: "Qualified", color: "bg-teal-500/10 border-teal-500/20" },
    { id: "site_visit_scheduled", title: "Visit Scheduled", color: "bg-blue-500/10 border-blue-500/20" },
    { id: "negotiation", title: "Negotiation", color: "bg-purple-500/10 border-purple-500/20" },
    { id: "booked", title: "Won", color: "bg-green-500/10 border-green-500/20" },
]

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
}

export function PipelineBoard() {
    const { data: initialLeads, isLoading, isError } = useLeads()
    const updateLead = useUpdateLead()
    
    const [leads, setLeads] = React.useState<any[]>([])
    const [activeLead, setActiveLead] = React.useState<any | null>(null)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (initialLeads) {
            setLeads(initialLeads)
        }
    }, [initialLeads])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const columns = React.useMemo(() => {
        const cols = new Map<string, any[]>()
        PIPELINE_STAGES.forEach((stage) => cols.set(stage.id, []))
        leads.forEach((lead) => {
            // Map "won" to "booked" column for leads
            const effectiveStage = lead.status === "won" ? "booked" : lead.status
            const stageLeads = cols.get(effectiveStage)
            if (stageLeads) {
                stageLeads.push(lead)
            }
        })
        return cols
    }, [leads])

    function onDragStart(event: DragStartEvent) {
        const { active } = event
        const activeLeadData = leads.find((l) => l.id === active.id)
        if (activeLeadData) {
            setActiveLead(activeLeadData)
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeLeadData = leads.find((l) => l.id === activeId)
        const overLeadData = leads.find((l) => l.id === overId)

        if (!activeLeadData) return

        const activeStage = activeLeadData.status === "won" ? "booked" : activeLeadData.status
        const overStage = (PIPELINE_STAGES.find((s) => s.id === overId) ? overId : (overLeadData?.status === "won" ? "booked" : overLeadData?.status))

        if (!overStage || activeStage === overStage) return

        setLeads((prev) => {
            const activeIndex = prev.findIndex((l) => l.id === activeId)
            const newLeads = [...prev]
            newLeads[activeIndex] = { ...newLeads[activeIndex], status: overStage === "booked" ? "won" : overStage }
            return newLeads
        })
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveLead(null)

        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeLeadIndex = leads.findIndex((l) => l.id === activeId)
        const overLeadIndex = leads.findIndex((l) => l.id === overId)

        if (activeLeadIndex !== -1) {
            const activeLeadData = leads[activeLeadIndex]
            updateLead.mutate({ id: activeLeadData.id, status: activeLeadData.status })
        }

        if (activeLeadIndex !== -1 && overLeadIndex !== -1) {
            setLeads((prev) => arrayMove(prev, activeLeadIndex, overLeadIndex))
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-destructive font-semibold">Failed to load pipeline data.</p>
            </div>
        )
    }

    if (!mounted) return null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex bg-background h-[calc(100vh-14rem)] overflow-x-auto pb-4 gap-4 items-start px-1">
                {PIPELINE_STAGES.map((stage) => (
                    <LeadPipelineColumn
                        key={stage.id}
                        id={stage.id}
                        title={stage.title}
                        color={stage.color}
                        leads={columns.get(stage.id) || []}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeLead && <LeadPipelineCard lead={activeLead} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
