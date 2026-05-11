"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Download, Upload, Check, AlertCircle, FileSpreadsheet, ArrowLeft, ArrowRight, Loader2, Info, X } from "lucide-react"
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
import { ImportProgressDashboard } from "@/components/leads/import-progress-dashboard"
import { ImportValidationSummary } from "@/components/leads/import-validation-summary"

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

type Step = "upload" | "mapping" | "validate" | "importing" | "complete"
type DuplicateStrategy = "skip" | "update" | "duplicate"

const STEPS = [
    { label: "Upload", description: "Upload file" },
    { label: "Mapping", description: "Match columns" },
    { label: "Validate", description: "Check data" },
    { label: "Import", description: "Process import" },
]

const getStepIndex = (step: Step) => {
    switch (step) {
        case "upload": return 0
        case "mapping": return 1
        case "validate": return 2
        case "importing": return 3
        case "complete": return 3
        default: return 0
    }
}

interface ValidationResult {
    validCount: number
    invalidCount: number
    duplicateCount: number
    sampleErrors: { row: number; field: string; message: string }[]
}

interface ImportProgress {
    id: string
    status: string
    totalRows: number
    processedRows: number
    successCount: number
    errorCount: number
    errors?: any[]
}

export default function ImportLeadsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    const [step, setStep] = React.useState<Step>("upload")
    const [file, setFile] = React.useState<File | null>(null)
    const [sessionId, setSessionId] = React.useState<string | null>(null)
    const [headers, setHeaders] = React.useState<string[]>([])
    const [previewData, setPreviewData] = React.useState<any[]>([])
    const [mapping, setMapping] = React.useState<Record<string, string>>({})
    const [isParsing, setIsParsing] = React.useState(false)
    const [isValidating, setIsValidating] = React.useState(false)
    const [isStarting, setIsStarting] = React.useState(false)
    const [validation, setValidation] = React.useState<ValidationResult | null>(null)
    const [duplicateStrategy, setDuplicateStrategy] = React.useState<DuplicateStrategy>("skip")
    const [importResult, setImportResult] = React.useState<ImportProgress | null>(null)

    // Check for active import session on mount
    React.useEffect(() => {
        const checkActiveSession = async () => {
            try {
                // Try to get active sessions from localStorage
                const lastSessionId = localStorage.getItem('lastImportSessionId')
                if (lastSessionId) {
                    const response = await api.get(`/leads/import/status/${lastSessionId}`)
                    const status = response.data
                    
                    if (status && ['queued', 'processing'].includes(status.status)) {
                        setSessionId(lastSessionId)
                        setImportResult(status)
                        setStep("importing")
                    } else if (status && status.status === 'completed') {
                        setSessionId(lastSessionId)
                        setImportResult(status)
                        setStep("complete")
                        toast.info('Previous import has completed. Review results below.')
                    }
                }
            } catch (err) {
                // No active session found, that's fine
                console.log('No active import session found')
            }
        }
        
        checkActiveSession()
    }, [])

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
        setValidation(null)

        const formData = new FormData()
        formData.append('file', uploadedFile)

        try {
            const response = await api.post(`/leads/import/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            setSessionId(response.data.sessionId)

            const parseResponse = await api.post(`/leads/import/parse/${response.data.sessionId}`)
            console.log('Parse response:', parseResponse.data)
            
            setHeaders(parseResponse.data.headers || [])
            setPreviewData(Array.isArray(parseResponse.data.preview) ? parseResponse.data.preview : [])
            
            const initialMapping: Record<string, string> = {}
            const headers = parseResponse.data.headers || []
            const preview = parseResponse.data.preview || []
            
            SYSTEM_FIELDS.forEach((field) => {
                const matchedHeader = headers.find((h: string) => 
                    h.toLowerCase() === field.label.replace(" *", "").toLowerCase() || 
                    h.toLowerCase() === field.value.toLowerCase()
                )
                if (matchedHeader) {
                    initialMapping[field.value] = matchedHeader
                }
            })
            setMapping(initialMapping)
            setStep("mapping")
            
            const totalRows = parseResponse.data.totalRows || 0
            console.log('Total rows:', totalRows, 'Preview rows:', preview.length)
            if (totalRows > 50000) {
                toast.warning(`Large file detected: ${totalRows.toLocaleString()} rows. Import may take several minutes.`)
            }
        } catch (error: any) {
            console.error('Parse error:', error)
            toast.error(error?.response?.data?.message || "Failed to parse file. Please ensure it's a valid XLS or CSV.")
        } finally {
            setIsParsing(false)
        }
    }

    const handleValidate = async () => {
        if (!sessionId) return

        setIsValidating(true)
        try {
            const response = await api.post(`/leads/import/validate/${sessionId}`, {
                mapping
            })
            setValidation(response.data)
            setStep("validate")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to validate file.")
        } finally {
            setIsValidating(false)
        }
    }

    const handleStartImport = async () => {
        if (!sessionId) return

        setIsStarting(true)
        try {
            const response = await api.post(`/leads/import/start/${sessionId}`, {
                mapping,
                duplicateStrategy
            })
            toast.success(response.data.message || "Import started!")
            // Save session ID to localStorage for recovery
            localStorage.setItem('lastImportSessionId', sessionId)
            setStep("importing")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to start import.")
        } finally {
            setIsStarting(false)
        }
    }

    const handleImportComplete = (result: ImportProgress) => {
        setImportResult(result)
        setStep("complete")
        queryClient.invalidateQueries({ queryKey: ["leads"] })
        // Clear localStorage on completion
        localStorage.removeItem('lastImportSessionId')
    }

    const handleReset = () => {
        setStep("upload")
        setFile(null)
        setSessionId(null)
        setHeaders([])
        setPreviewData([])
        setMapping({})
        setValidation(null)
        setImportResult(null)
        localStorage.removeItem('lastImportSessionId')
    }

    const handleRemoveFile = () => {
        if (sessionId) {
            api.post(`/leads/import/delete/${sessionId}`).catch(() => {})
        }
        handleReset()
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push("/leads")} className="h-9 w-9 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Import Leads</h1>
                        <p className="text-sm text-muted-foreground">Upload and import your lead database to the CRM.</p>
                    </div>
                </div>
                <div className="w-full md:w-80">
                    <Stepper steps={STEPS} currentStep={getStepIndex(step)} />
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold">
                                {step === "upload" && "Step 1: Upload File"}
                                {step === "mapping" && "Step 2: Map Columns"}
                                {step === "validate" && "Step 3: Validate Data"}
                                {step === "importing" && "Step 4: Importing Leads"}
                                {step === "complete" && "Import Complete"}
                            </CardTitle>
                            <CardDescription>
                                {step === "upload" && "Choose an Excel or CSV file to begin."}
                                {step === "mapping" && "Match your file columns to CRM fields."}
                                {step === "validate" && "Review the data before final import."}
                                {step === "importing" && "Processing your leads in the background."}
                                {step === "complete" && "Summary of the import process."}
                            </CardDescription>
                        </div>
                        {file && step !== "upload" && step !== "importing" && step !== "complete" && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-realty-gold/10 text-realty-gold border border-realty-gold/20">
                                    {file.name}
                                </span>
                                <button 
                                    onClick={handleRemoveFile}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
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
                                    Excel (.xlsx, .xls) or CSV files up to 50MB.
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
                                        <p className="text-sm font-medium">Uploading and analyzing file...</p>
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

                            <div className="border rounded-lg overflow-hidden bg-muted/5">
                                <div className="max-h-64 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                {headers.map((header, idx) => (
                                                    <TableHead key={idx} className="h-10 px-4 text-xs font-semibold uppercase whitespace-nowrap bg-muted/30">
                                                        {header}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.slice(0, 10).map((row: unknown[], i) => (
                                                <TableRow key={i} className={cn("hover:bg-accent/50 border-b", i % 2 === 1 && "bg-muted/10")}>
                                                    {row.map((cell, idx) => (
                                                        <TableCell key={idx} className="py-2.5 px-4 text-sm">
                                                            {cell !== null && cell !== undefined ? String(cell) : ''}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <Button variant="ghost" size="sm" onClick={handleReset}>Upload Different File</Button>
                                <Button 
                                    size="sm" 
                                    className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground" 
                                    onClick={handleValidate}
                                    disabled={isValidating || !mapping.name || !mapping.phone}
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Validating...
                                        </>
                                    ) : (
                                        <>
                                            Validate Data
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "validate" && validation && (
                        <ImportValidationSummary
                            validation={validation}
                            onStartImport={handleStartImport}
                            onBack={() => setStep("mapping")}
                            duplicateStrategy={duplicateStrategy}
                            onDuplicateStrategyChange={setDuplicateStrategy}
                            isStarting={isStarting}
                        />
                    )}

                    {step === "importing" && sessionId && (
                        <ImportProgressDashboard
                            sessionId={sessionId}
                            onComplete={handleImportComplete}
                            onCancel={() => setStep("mapping")}
                        />
                    )}

                    {step === "complete" && importResult && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                    importResult.status === 'completed' 
                                        ? 'bg-green-500/10 text-green-500' 
                                        : 'bg-red-500/10 text-red-500'
                                }`}>
                                    <Check className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold">
                                    {importResult.status === 'completed' ? 'Import Completed Successfully!' : 'Import Completed with Errors'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {importResult.status === 'completed' 
                                        ? 'All leads have been imported to the CRM.' 
                                        : 'Some leads may not have been imported due to errors.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                <Card className="bg-muted/20 text-center p-4">
                                    <p className="text-2xl font-bold">{importResult.totalRows.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Rows</p>
                                </Card>
                                <Card className="bg-green-500/5 border-green-500/20 text-center p-4">
                                    <p className="text-2xl font-bold text-green-600">{importResult.successCount.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600/60">Imported</p>
                                </Card>
                                <Card className="bg-red-500/5 border-red-500/20 text-center p-4">
                                    <p className="text-2xl font-bold text-red-600">{importResult.errorCount.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600/60">Errors</p>
                                </Card>
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="space-y-2 max-w-2xl mx-auto">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Error Summary (first 20)</p>
                                    <div className="border rounded-lg overflow-hidden bg-muted/5 max-h-48 overflow-y-auto">
                                        <Table>
                                            <TableBody>
                                                {importResult.errors.slice(0, 20).map((err: any, i: number) => (
                                                    <TableRow key={i} className="hover:bg-red-500/5 border-none">
                                                        <TableCell className="w-8 pl-4">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium py-2">
                                                            {err.lead || `Row ${err.row}`}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-red-500 py-2 text-right">
                                                            {err.error || err.message}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 pt-4">
                                {importResult.errorCount > 0 && (
                                    <Button 
                                        variant="outline" 
                                        onClick={async () => {
                                            try {
                                                const response = await api.get(`/leads/import/report/${sessionId}`, {
                                                    responseType: 'blob'
                                                })
                                                const url = window.URL.createObjectURL(new Blob([response.data]))
                                                const link = document.createElement('a')
                                                link.href = url
                                                link.setAttribute('download', `import_errors_${sessionId}.csv`)
                                                document.body.appendChild(link)
                                                link.click()
                                                link.remove()
                                            } catch {
                                                toast.error("Failed to download report")
                                            }
                                        }}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Error Report
                                    </Button>
                                )}
                                <Button 
                                    className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground font-bold px-8" 
                                    onClick={() => router.push("/leads")}
                                >
                                    View Imported Leads
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex justify-center pt-2">
                                <Button variant="ghost" onClick={handleReset}>
                                    Import More Leads
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}