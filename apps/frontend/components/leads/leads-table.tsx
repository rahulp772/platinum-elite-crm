"use client"

import * as React from "react"
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
import { MoreHorizontal, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
import { Lead } from "@/types/lead"
import { cn } from "@/lib/utils"

const statusColors = {
    new: "bg-realty-navy/10 text-realty-navy border-realty-navy/20",
    contacted: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    qualified: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    lost: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
}

const statusLabels = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    lost: "Lost",
}

export const columns: ColumnDef<Lead>[] = [
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
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <div className="capitalize font-medium">{String(row.getValue("source")).replace("_", " ")}</div>,
    },
    {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("budget"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
            }).format(amount)
            return <div className="font-bold tabular-nums">{formatted}</div>
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="max-w-[180px] truncate text-muted-foreground">{row.getValue("location")}</div>
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
            return (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Lead Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.email)}>
                                Copy Email Address
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Journey</DropdownMenuItem>
                            <DropdownMenuItem>Edit Properties</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600">Archive Lead</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]

interface LeadsTableProps {
    data: Lead[]
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

export function LeadsTable({ data }: LeadsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting, columnFilters },
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
                                            index % 2 === 1 && "bg-muted/20"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell, idx) => (
                                            <TableCell key={cell.id} className={getCellClass(idx, headerCount)}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No leads found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground font-medium">
                    {table.getFilteredRowModel().rows.length} lead(s) found
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8">
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}