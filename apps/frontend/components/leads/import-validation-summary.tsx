"use client"

import * as React from "react"
import { Check, AlertTriangle, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ValidationResult {
    validCount: number
    invalidCount: number
    duplicateCount: number
    sampleErrors: { row: number; field: string; message: string }[]
}

interface ImportValidationSummaryProps {
    validation: ValidationResult | null
    onStartImport: () => void
    onBack: () => void
    duplicateStrategy: 'skip' | 'update' | 'duplicate'
    onDuplicateStrategyChange: (strategy: 'skip' | 'update' | 'duplicate') => void
    isStarting: boolean
}

export function ImportValidationSummary({
    validation,
    onStartImport,
    onBack,
    duplicateStrategy,
    onDuplicateStrategyChange,
    isStarting
}: ImportValidationSummaryProps) {
    const [showErrors, setShowErrors] = React.useState(false)

    if (!validation) return null

    const totalSampleRows = validation.validCount + validation.invalidCount + validation.duplicateCount
    const hasErrors = validation.invalidCount > 0 || validation.duplicateCount > 0

    return (
        <div className="space-y-6">
            <Alert className={cn(
                "border-2",
                hasErrors ? "bg-amber-500/10 border-amber-500/30" : "bg-green-500/10 border-green-500/30"
            )}>
                {hasErrors ? (
                    <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-900 dark:text-amber-100">
                            <strong>{validation.invalidCount + validation.duplicateCount}</strong> rows have issues 
                            (missing data or duplicates). Valid rows will still be imported.
                        </AlertDescription>
                    </>
                ) : (
                    <>
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900 dark:text-green-100">
                            All sample rows look good. Ready to import!
                        </AlertDescription>
                    </>
                )}
            </Alert>

            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{validation.validCount}</p>
                        <p className="text-xs font-medium text-green-600/80 uppercase tracking-wider">Valid Rows</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{validation.duplicateCount}</p>
                        <p className="text-xs font-medium text-amber-600/80 uppercase tracking-wider">Duplicates</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{validation.invalidCount}</p>
                        <p className="text-xs font-medium text-red-600/80 uppercase tracking-wider">Invalid Rows</p>
                    </CardContent>
                </Card>
            </div>

            {validation.duplicateCount > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold">Duplicate Handling Strategy</p>
                    <div className="flex gap-4">
                        <label className={cn(
                            "flex-1 p-4 border rounded-lg cursor-pointer transition-colors",
                            duplicateStrategy === 'skip' ? "border-realty-gold bg-realty-gold/5" : "border-border hover:border-muted-foreground/30"
                        )}>
                            <input 
                                type="radio" 
                                name="duplicateStrategy" 
                                value="skip"
                                checked={duplicateStrategy === 'skip'}
                                onChange={() => onDuplicateStrategyChange('skip')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                    duplicateStrategy === 'skip' ? "border-realty-gold bg-realty-gold" : "border-muted-foreground"
                                )}>
                                    {duplicateStrategy === 'skip' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div>
                                    <p className="font-medium">Skip Duplicates</p>
                                    <p className="text-xs text-muted-foreground">Don't import leads with existing phone numbers</p>
                                </div>
                            </div>
                        </label>
                        <label className={cn(
                            "flex-1 p-4 border rounded-lg cursor-pointer transition-colors",
                            duplicateStrategy === 'update' ? "border-realty-gold bg-realty-gold/5" : "border-border hover:border-muted-foreground/30"
                        )}>
                            <input 
                                type="radio" 
                                name="duplicateStrategy" 
                                value="update"
                                checked={duplicateStrategy === 'update'}
                                onChange={() => onDuplicateStrategyChange('update')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                    duplicateStrategy === 'update' ? "border-realty-gold bg-realty-gold" : "border-muted-foreground"
                                )}>
                                    {duplicateStrategy === 'update' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div>
                                    <p className="font-medium">Update Existing</p>
                                    <p className="text-xs text-muted-foreground">Update lead data if phone exists</p>
                                </div>
                            </div>
                        </label>
                        <label className={cn(
                            "flex-1 p-4 border rounded-lg cursor-pointer transition-colors",
                            duplicateStrategy === 'duplicate' ? "border-realty-gold bg-realty-gold/5" : "border-border hover:border-muted-foreground/30"
                        )}>
                            <input 
                                type="radio" 
                                name="duplicateStrategy" 
                                value="duplicate"
                                checked={duplicateStrategy === 'duplicate'}
                                onChange={() => onDuplicateStrategyChange('duplicate')}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                    duplicateStrategy === 'duplicate' ? "border-realty-gold bg-realty-gold" : "border-muted-foreground"
                                )}>
                                    {duplicateStrategy === 'duplicate' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div>
                                    <p className="font-medium">Create Duplicates</p>
                                    <p className="text-xs text-muted-foreground">Import all leads (may create duplicates)</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {validation.invalidCount > 0 && (
                <div className="space-y-2">
                    <button 
                        onClick={() => setShowErrors(!showErrors)}
                        className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        View sample errors ({validation.sampleErrors.length})
                        {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    {showErrors && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Row</th>
                                            <th className="px-3 py-2 text-left font-medium">Field</th>
                                            <th className="px-3 py-2 text-left font-medium">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validation.sampleErrors.map((err, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-3 py-2">{err.row}</td>
                                                <td className="px-3 py-2">{err.field}</td>
                                                <td className="px-3 py-2 text-red-600">{err.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="ghost" onClick={onBack}>
                    Back to Mapping
                </Button>
                <Button 
                    className="bg-realty-gold hover:bg-realty-gold/90 text-primary-foreground"
                    onClick={onStartImport}
                    disabled={isStarting}
                >
                    {isStarting ? "Starting..." : `Import ${validation.validCount} Leads`}
                </Button>
            </div>
        </div>
    )
}