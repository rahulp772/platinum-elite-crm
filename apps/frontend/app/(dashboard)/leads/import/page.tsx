"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Download, Upload, Check, AlertCircle, FileSpreadsheet, ArrowLeft, ArrowRight, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stepper } from "@/components/ui/stepper"
import api from "@/lib/api"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const SYSTEM_FIELDS = [
    { value: "name", label: "Name *" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone *" },
    { value: "whatsappNumber", label: "WhatsApp Number" },
    { value: "status", label: "Status" },
    { value: "source", label: "Source" },
    { value: "budgetMin", label: "Budget Min" },
    { value: "budgetMax", label: "Budget Max" },
    { value: "preferredLocation", label: "Preferred Location" },
    { value: "propertyType", label: "Property Type" },
    { value: "bedroom", label: "Bedroom" },
    { value: "tier", label: "Tier" },
    { value: "notes", label: "Notes" },
]

type Step = "upload" | "mapping" | "preview" | "processing" | "result"

const STEPS = [
    { label: "Upload", description: "Upload lead file" },
    { label: "Mapping", description: "Match columns" },
    { label: "Preview", description: "Review data" },
    { label: "Result", description: "Import status" }
]

const getStepIndex = (step: Step) => {
    switch (step) {
        case "upload": return 0
        case "mapping": return 1
        case "preview": return 2
        case "processing": return 2
        case "result": return 3
        default: return 0
    }
}

export default function ImportLeadsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    const [step, setStep] = React.useState<Step>("upload")
    const [file, setFile] = React.useState<File | null>(null)
    const [headers, setHeaders] = React.useState<string[]>([])
    const [previewData, setPreviewData] = React.useState<any[]>([])
    const [fullData, setFullData] = React.useState<any[]>([])
    const [mapping, setMapping] = React.useState<Record<string, string>>({})
    const [isParsing, setIsParsing] = React.useState(false)
    const [isImporting, setIsImporting] = React.useState(false)
    const [importResult, setImportResult] = React.useState<{
        successCount: number
        errorCount: number
        errors: any[]
    } | null>(null)

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get(`/leads/import/template`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'leads_template.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            toast.error("Failed to download template")
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0]
        if (!uploadedFile) return

        setFile(uploadedFile)
        setIsParsing(true)

        const formData = new FormData()
        formData.append('file', uploadedFile)

        try {
            const response = await api.post(`/leads/import/parse`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setHeaders(response.data.headers)
            setPreviewData(response.data.preview)
            setFullData(response.data.data)
            
            // Auto-map: Check which file headers match system fields
            const initialMapping: Record<string, string> = {}
            SYSTEM_FIELDS.forEach((field) => {
                const matchedHeader = response.data.headers.find((h: string) => 
                    h.toLowerCase() === field.label.replace(" *", "").toLowerCase() || 
                    h.toLowerCase() === field.value.toLowerCase()
                )
                if (matchedHeader) {
                    initialMapping[field.value] = matchedHeader
                }
            })
            setMapping(initialMapping)
            setStep("mapping")
        } catch (error) {
            toast.error("Failed to parse file. Please ensure it's a valid XLS or CSV.")
        } finally {
            setIsParsing(false)
        }
    }

    const handleStartImport = async () => {
        setIsImporting(true)
        setStep("processing")

        try {
            const response = await api.post(`/leads/import/confirm`, {
                data: fullData,
                mapping
            }, { withCredentials: true })

            setImportResult(response.data)
            setStep("result")
            queryClient.invalidateQueries({ queryKey: ["leads"] })
            toast.success("Import completed!")
        } catch (error) {
            toast.error("Import failed")
            setStep("mapping")
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push("/leads")} className="h-9 w-9 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Import Leads</h1>
                        <p className="text-sm text-muted-foreground">Upload and map your lead database to the CRM.</p>
                    </div>
                </div>
                <div className="w-full md:w-80">
                    <Stepper steps={STEPS} currentStep={getStepIndex(step)} />
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold">
                                    {step === "upload" && "Step 1: Upload File"}
                                    {step === "mapping" && "Step 2: Map Columns"}
                                    {step === "preview" && "Step 3: Preview Data"}
                                    {step === "processing" && "Processing..."}
                                    {step === "result" && "Import Results"}
                                </CardTitle>
                                <CardDescription>
                                    {step === "upload" && "Choose an Excel or CSV file to begin."}
                                    {step === "mapping" && "Match your file columns to CRM fields."}
                                    {step === "preview" && "Review the data before final import."}
                                    {step === "result" && "Summary of the import process."}
                                </CardDescription>
                            </div>
                            {file && step !== "upload" && step !== "processing" && (
                                <div className="text-xs font-medium px-3 py-1 rounded-full bg-realty-gold/10 text-realty-gold border border-realty-gold/20">
                                    {file.name}
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {step === "upload" && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl p-12 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer relative group">
                                    <div className="h-12 w-12 rounded-full bg-realty-gold/10 flex items-center justify-center mb-4">
                                        <Upload className="h-6 w-6 text-realty-gold" />
                                    </div>
                                    <p className="font-semibold text-center">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground mt-1 text-center">
                                        Excel (.xlsx, .xls) or CSV files up to 10MB.
                                    </p>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        accept=".csv, .xlsx, .xls"
                                        onChange={handleFileUpload}
                                        disabled={isParsing}
                                    />
                                    {isParsing && (
                                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-xl z-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-realty-gold mb-2" />
                                            <p className="text-sm font-medium">Analyzing file...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-semibold">Need a template?</p>
                                            <p className="text-muted-foreground">Download our sample file for easy mapping.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Template
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === "mapping" && (
                            <div className="space-y-6">
                                <Alert className="bg-realty-gold/5 border-realty-gold/20">
                                    <Info className="h-4 w-4 text-realty-gold" />
                                    <AlertTitle className="text-realty-gold text-sm font-bold">Auto-mapping Active</AlertTitle>
                                    <AlertDescription className="text-realty-gold/80 text-xs">
                                        We've matched columns that look like CRM fields. Please verify them below.
                                    </AlertDescription>
                                </Alert>

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="h-10 text-xs font-semibold uppercase">System Field</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead className="h-10 text-xs font-semibold uppercase">File Header</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {SYSTEM_FIELDS.map((field, idx) => (
                                                <TableRow key={field.value} className={cn("hover:bg-accent/50", idx % 2 === 1 && "bg-muted/20")}>
                                                    <TableCell className="py-3 font-medium text-sm">
                                                        {field.label}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Select 
                                                            value={mapping[field.value] || "unmapped"} 
                                                            onValueChange={(val) => setMapping(prev => ({ ...prev, [field.value]: val }))}
                                                        >
                                                            <SelectTrigger className="h-9 w-full max-w-[240px] text-sm">
                                                                <SelectValue placeholder="Select Source Column" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="unmapped" className="text-muted-foreground">--- Skip ---</SelectItem>
                                                                {headers.map(header => (
                                                                    <SelectItem key={header} value={header}>{header}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>Back</Button>
                                    <Button size="sm" className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground" onClick={() => setStep("preview")}>
                                        Preview Data
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === "preview" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">Data Preview ({previewData.length} of {fullData.length} records)</p>
                                </div>

                                <div className="border rounded-lg overflow-hidden bg-muted/5">
                                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10">
                                                <TableRow className="bg-muted/30">
                                                    {Object.entries(mapping).filter(([_, header]) => header !== "unmapped").map(([field, _]) => (
                                                        <TableHead key={field} className="h-10 px-4 text-xs font-semibold uppercase whitespace-nowrap">
                                                            {SYSTEM_FIELDS.find(f => f.value === field)?.label.replace(" *", "")}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.map((row, i) => (
                                                    <TableRow key={i} className={cn("hover:bg-accent/50 border-b", i % 2 === 1 && "bg-muted/10")}>
                                                        {Object.entries(mapping).filter(([_, header]) => header !== "unmapped").map(([field, header]) => (
                                                            <TableCell key={field} className="py-2.5 px-4 text-sm tabular-nums">
                                                                {row[header]?.toString() || <span className="text-muted-foreground/30 italic">Empty</span>}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <Button variant="ghost" size="sm" onClick={() => setStep("mapping")}>Back</Button>
                                    <Button size="sm" className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground font-bold" onClick={handleStartImport}>
                                        Start Import
                                        <Check className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === "processing" && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-realty-gold" />
                                <div className="text-center">
                                    <h2 className="text-xl font-bold">Importing Leads...</h2>
                                    <p className="text-sm text-muted-foreground">Please wait while we process your data.</p>
                                </div>
                            </div>
                        )}

                        {step === "result" && importResult && (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                        <Check className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-bold">Import Completed</h2>
                                    <p className="text-sm text-muted-foreground">The lead import process has finished.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-green-500/5 border-green-500/20 text-center p-4">
                                        <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600/60">Success</p>
                                    </Card>
                                    <Card className="bg-red-500/5 border-red-500/20 text-center p-4">
                                        <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-600/60">Errors</p>
                                    </Card>
                                </div>

                                {importResult.errors.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Error Logs</p>
                                        <div className="border rounded-lg overflow-hidden bg-muted/5">
                                            <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                                <Table>
                                                    <TableBody>
                                                        {importResult.errors.map((err, i) => (
                                                            <TableRow key={i} className="hover:bg-red-500/5 border-none">
                                                                <TableCell className="w-8 pl-4">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                </TableCell>
                                                                <TableCell className="text-sm font-medium py-2">
                                                                    {err.lead || `Row ${err.row}`}
                                                                </TableCell>
                                                                <TableCell className="text-xs text-red-500 py-2 text-right">
                                                                    {err.error}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-4">
                                    <Button className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground font-bold px-8" onClick={() => router.push("/leads")}>
                                        Back to Leads
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "outline" | "destructive", className?: string }) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        destructive: "bg-destructive text-destructive-foreground",
    }
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>{children}</span>
}
