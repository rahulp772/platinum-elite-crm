"use client"

import * as React from "react"
import Link from "next/link"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, Mail, Phone, Calendar, MessageCircle, FileText, CheckCircle, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Lead } from "@/types/lead"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
    new: "bg-realty-navy/10 text-realty-navy border-realty-navy/20",
    contacted: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    rnr: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    qualified: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    site_visit_scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    site_visit_done: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    negotiation: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    booked: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    interested: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    not_interested: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    lost: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
}

const statusLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    rnr: "Ringing No Response",
    qualified: "Qualified",
    site_visit_scheduled: "Visit Scheduled",
    site_visit_done: "Visit Done",
    negotiation: "Negotiation",
    booked: "Booked",
    interested: "Interested",
    not_interested: "Not Interested",
    lost: "Lost",
}

function formatINR(amount: number): string {
    if (!amount || isNaN(amount)) return "-"
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`
    }
    return `₹${(amount / 100000).toFixed(1)} L`
}

function formatBudgetRange(min?: number, max?: number): string {
    if ((!min || isNaN(min)) && (!max || isNaN(max))) return "-"
    const validMin = min && !isNaN(min) ? min : 0
    const validMax = max && !isNaN(max) ? max : 0
    if (validMin === validMax || !validMax) return formatINR(validMin || validMax)
    return `${formatINR(validMin)} - ${formatINR(validMax)}`
}

export function createColumns(onEdit?: (lead: Lead) => void): ColumnDef<Lead>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="mx-1"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="mx-1"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-semibold">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate text-muted-foreground">{row.original.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="text-muted-foreground">{row.original.phone}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusColors
            return (
                <Badge variant="outline" className={cn("font-medium px-2 py-0.5 text-xs uppercase tracking-wider", statusColors[status])}>
                    {statusLabels[status]}
                </Badge>
            )
        },
    },
    {
        accessorKey: "followUpAt",
        header: "Follow Up",
        cell: ({ row }) => {
            const followUpAt = row.original.followUpAt
            if (!followUpAt) return <span className="text-muted-foreground text-sm">-</span>
            const date = new Date(followUpAt)
            const isOverdue = date < new Date()
            return (
                <div className={cn("flex items-center gap-1 text-sm", isOverdue && "text-rose-600 font-medium")}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{date.toLocaleDateString()}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <div className="capitalize font-medium">{String(row.getValue("source")).replace("_", " ")}</div>,
    },
    {
        accessorKey: "budgetMin",
        header: "Budget",
        cell: ({ row }) => {
            const budgetMin = row.original.budgetMin
            const budgetMax = row.original.budgetMax
            return <div className="font-bold tabular-nums">{formatBudgetRange(budgetMin, budgetMax)}</div>
        },
    },
    {
        accessorKey: "preferredLocation",
        header: "Location",
        cell: ({ row }) => (
            <div className="max-w-[180px] truncate text-muted-foreground">{row.original.preferredLocation || "-"}</div>
        ),
    },
    {
        accessorKey: "propertyType",
        header: "Property Type",
        cell: ({ row }) => (
            <Badge variant="secondary" className="bg-secondary/50 font-normal">
                {row.getValue("propertyType")}
            </Badge>
        ),
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const lead = row.original
            const handleCall = (e: React.MouseEvent) => {
                e.stopPropagation()
                window.open(`tel:${lead.phone}`)
            }
            const handleWhatsApp = (e: React.MouseEvent) => {
                e.stopPropagation()
                const waNumber = lead.whatsappNumber || lead.phone
                window.open(`https://wa.me/${waNumber.replace(/\D/g, "")}`)
            }
            const handleNote = (e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(lead)
            }
            const handleViewDetails = (e: React.MouseEvent) => {
                e.stopPropagation()
                // Navigate to lead detail page handled by onClick on row
            }
            const handleEdit = (e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(lead)
            }
            return (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" title="Call" onClick={handleCall}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700" title="WhatsApp" onClick={handleWhatsApp}>
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700" title="Add Note" onClick={handleNote}>
                        <FileText className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Lead Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/leads/${lead.id}`} className="cursor-pointer flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleEdit}>
                                Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.email)}>
                                Copy Email Address
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600">Archive Lead</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]}

interface LeadsTableProps {
    data: Lead[]
    onEdit?: (lead: Lead) => void
    onSelectionChange?: (selectedLeads: Lead[]) => void
    onRowClick?: (lead: Lead) => void
}

function getCellClass(index: number, total: number): string {
    const isSource = index === 3
    const isBudget = index === 4
    const isLocation = index === 5
    if (isSource) return "px-6 py-3 align-middle"
    if (isBudget) return "px-6 py-3 align-middle"
    if (isLocation) return "px-6 py-3 align-middle"
    return "px-4 py-3 align-middle"
}

function getHeaderClass(index: number, total: number): string {
    const isSource = index === 3
    const isBudget = index === 4
    const isLocation = index === 5
    if (isSource) return "bg-muted/30 px-6 py-3 h-12 text-sm font-semibold align-middle"
    if (isBudget) return "bg-muted/30 px-6 py-3 h-12 text-sm font-semibold align-middle"
    if (isLocation) return "bg-muted/30 px-6 py-3 h-12 text-sm font-semibold align-middle"
    return "bg-muted/30 px-4 py-3 h-12 text-sm font-semibold align-middle"
}

export function LeadsTable({ data, onEdit, onSelectionChange }: LeadsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
    const dataRef = React.useRef(data)
    const onSelectionChangeRef = React.useRef(onSelectionChange)
    
    React.useEffect(() => {
        dataRef.current = data
    }, [data])
    
    React.useEffect(() => {
        onSelectionChangeRef.current = onSelectionChange
    }, [onSelectionChange])
    
    React.useEffect(() => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key])
        const selectedRows = selectedIds.map(id => dataRef.current.find((d: Lead) => d.id === id)).filter(Boolean) as Lead[]
        onSelectionChangeRef.current?.(selectedRows)
    }, [rowSelection])
    
    React.useEffect(() => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key])
        const selectedRows = selectedIds.map(id => dataRef.current.find((d: Lead) => d.id === id)).filter(Boolean) as Lead[]
        onSelectionChangeRef.current?.(selectedRows)
    }, [rowSelection])

    const table = useReactTable({
        data,
        columns: createColumns(onEdit),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.id,
        enableRowSelection: true,
        state: { sorting, columnFilters, rowSelection },
    })

    const headerCount = table.getAllColumns().length

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                                    {headerGroup.headers.map((header, idx) => (
                                        <TableHead key={header.id} className={getHeaderClass(idx, headerCount)}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={cn(
                                            "cursor-pointer hover:bg-accent/50 border-b",
                                            index % 2 === 1 && "bg-muted/20",
                                            row.getIsSelected() && "bg-primary/10"
                                        )}
                                        onClick={() => onEdit?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell, idx) => (
                                            <TableCell 
                                                key={cell.id} 
                                                className={getCellClass(idx, headerCount)}
                                                onClick={(e) => {
                                                    if (cell.column.id === "select" || cell.column.id === "actions") {
                                                        e.stopPropagation()
                                                    }
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                        No leads found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
            <div className="flex items-center justify-between px-2 py-4 border-t bg-muted/5">
                <div className="flex items-center gap-6">
                    <div className="text-sm text-muted-foreground font-medium">
                        {(() => {
                            const total = table.getFilteredRowModel().rows.length
                            const pageSize = table.getState().pagination.pageSize
                            const pageIndex = table.getState().pagination.pageIndex
                            const start = total === 0 ? 0 : pageIndex * pageSize + 1
                            const end = Math.min(pageIndex * pageSize + pageSize, total)
                            return (
                                <>
                                    Showing <span className="text-foreground font-semibold">{start}</span> to{" "}
                                    <span className="text-foreground font-semibold">{end}</span> of{" "}
                                    <span className="text-foreground font-semibold">{total}</span> leads
                                </>
                            )
                        })()}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] bg-background">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="bg-background border-border">
                                {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="cursor-pointer">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()} 
                        className="h-8 px-3"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {(() => {
                            const totalPages = table.getPageCount()
                            const currentPage = table.getState().pagination.pageIndex + 1
                            
                            const getVisiblePages = (current: number, total: number) => {
                                if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
                                if (current <= 3) return [1, 2, 3, 4, "...", total]
                                if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total]
                                return [1, "...", current - 1, current, current + 1, "...", total]
                            }

                            return getVisiblePages(currentPage, totalPages).map((page, i) => (
                                <React.Fragment key={i}>
                                    {page === "..." ? (
                                        <span className="px-2 text-muted-foreground text-sm">...</span>
                                    ) : (
                                        <Button
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => table.setPageIndex((page as number) - 1)}
                                            className={cn(
                                                "h-8 w-8 p-0 text-xs font-semibold",
                                                currentPage === page ? "bg-realty-gold text-primary-foreground hover:bg-realty-gold/90" : "hover:bg-realty-gold/10 hover:text-realty-gold"
                                            )}
                                        >
                                            {page}
                                        </Button>
                                    )}
                                </React.Fragment>
                            ))
                        })()}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => table.nextPage()} 
                        disabled={!table.getCanNextPage()} 
                        className="h-8 px-3"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}