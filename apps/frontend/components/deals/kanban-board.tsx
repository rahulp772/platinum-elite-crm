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
import { DealCard } from "./deal-card"
import { BoardColumn } from "./board-column"
import { Deal, DealStage, dealStages } from "@/types/deal"
import { createPortal } from "react-dom"
import { useUpdateDealStage } from "@/hooks/use-deals"
import { useIsMobile } from "@/lib/hooks/use-media-query"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface KanbanBoardProps {
    initialDeals: Deal[]
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
}

export function KanbanBoard({ initialDeals }: KanbanBoardProps) {
    const [deals, setDeals] = React.useState<Deal[]>(initialDeals)
    const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null)
    const [selectedDealForMove, setSelectedDealForMove] = React.useState<Deal | null>(null)
    const [moveDialogStage, setMoveDialogStage] = React.useState<DealStage | null>(null)
    const updateDealStage = useUpdateDealStage()
    const isMobile = useIsMobile()

    // Update local state when initialDeals changes
    React.useEffect(() => {
        setDeals(initialDeals)
    }, [initialDeals])

    // On mobile, use higher activation distance to prevent accidental drags
    // and disable keyboard sensor entirely
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: isMobile ? 15 : 5, // Require more movement on mobile
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Mobile: Handle tap to move deal
    const handleDealTap = (deal: Deal) => {
        if (isMobile) {
            setSelectedDealForMove(deal)
            setMoveDialogStage(null)
        }
    }

    const handleMoveToStage = (stage: DealStage) => {
        if (selectedDealForMove) {
            setDeals(prev => prev.map(d => 
                d.id === selectedDealForMove.id ? { ...d, stage } : d
            ))
            updateDealStage.mutate({ id: selectedDealForMove.id, stage })
            setSelectedDealForMove(null)
            setMoveDialogStage(null)
        }
    }

    // Columns derivation
    const columns = React.useMemo(() => {
        const cols = new Map<DealStage, Deal[]>()
        dealStages.forEach((stage) => cols.set(stage.id, []))
        deals.forEach((deal) => {
            const stageDeals = cols.get(deal.stage)
            if (stageDeals) {
                stageDeals.push(deal)
            }
        })
        return cols
    }, [deals])

    function onDragStart(event: DragStartEvent) {
        const { active } = event
        const activeDeal = deals.find((d) => d.id === active.id)
        if (activeDeal) {
            setActiveDeal(activeDeal)
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        // Find the containers (stages)
        const activeDeal = deals.find((d) => d.id === activeId)
        const overDeal = deals.find((d) => d.id === overId)

        if (!activeDeal) return

        const activeStage = activeDeal.stage
        // If hovering over a column (id is stage id), use that
        // If hovering over a card (id is deal id), use its stage
        const overStage = (dealStages.find((s) => s.id === overId) ? overId : overDeal?.stage) as DealStage

        if (!overStage || activeStage === overStage) return

        // Move to new stage immediately for visual feedback
        setDeals((prev) => {
            const activeIndex = prev.findIndex((d) => d.id === activeId)
            const newDeals = [...prev]
            newDeals[activeIndex] = { ...newDeals[activeIndex], stage: overStage }
            return newDeals
        })
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveDeal(null)

        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeDealIndex = deals.findIndex((d) => d.id === activeId)
        const overDealIndex = deals.findIndex((d) => d.id === overId)

        if (activeDealIndex !== -1) {
            const activeDeal = deals[activeDealIndex]
            // If the stage changed, sync with backend
            if (activeDeal.stage !== activeDeal.stage) { // This check is dummy because onDragOver already updated it
                // Actually, onDragOver updates local state. 
                // We should sync the final stage here.
            }
            updateDealStage.mutate({ id: activeDeal.id, stage: activeDeal.stage })
        }

        if (activeDealIndex !== -1 && overDealIndex !== -1) {
            setDeals((prev) => arrayMove(prev, activeDealIndex, overDealIndex))
        }
    }

    // Hydration safety
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex bg-background h-[calc(100vh-14rem)] overflow-x-auto pb-4 gap-4 items-start">
                    {dealStages.map((stage) => (
                        <BoardColumn
                            key={stage.id}
                            id={stage.id}
                            deals={columns.get(stage.id) || []}
                            onDealTap={handleDealTap}
                        />
                    ))}
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeDeal && <DealCard deal={activeDeal} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Mobile Move Dialog */}
            <Dialog open={!!selectedDealForMove} onOpenChange={() => setSelectedDealForMove(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Move Deal</DialogTitle>
                        <DialogDescription>
                            Select a stage to move "{selectedDealForMove?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 py-4">
                        {dealStages.map((stage) => (
                            <Button
                                key={stage.id}
                                variant={selectedDealForMove?.stage === stage.id ? "default" : "outline"}
                                className={selectedDealForMove?.stage === stage.id ? "bg-realty-gold hover:bg-realty-gold/90" : ""}
                                onClick={() => handleMoveToStage(stage.id)}
                            >
                                {stage.label}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
