"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileUp, Send, FileText, X, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { processCSV } from "@/app/actions"
import { useSettings } from "@/lib/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import ProcessingResults from "@/components/processing-results"

interface ProcessResult {
  successCount: number
  failedCount: number
  errors: string[]
  responses: any[]
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingResults, setProcessingResults] = useState<ProcessResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()
  const { settings, updateSettings } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Quick settings for webhook URL and auth token
  const [quickWebhookUrl, setQuickWebhookUrl] = useState(settings.webhookUrl || "")
  const [quickAuthToken, setQuickAuthToken] = useState(settings.authToken || "")

  // Save quick settings
  const saveQuickSettings = () => {
    updateSettings({
      webhookUrl: quickWebhookUrl,
      authToken: quickAuthToken,
    })
    toast({
      title: "Settings Saved",
      description: "Your webhook settings have been updated",
    })
  }

  const handleFileSelect = () => {
    // Directly trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsLoading(true)
    setError(null)
    setShowResults(false)
    setProcessingResults(null)

    // Automatically load and preview the CSV data
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        // Handle different line endings (Windows, Mac, Linux)
        const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0)
        const headers = lines[0].split(",").map((header) => header.trim())

        // Validate required columns
        const requiredColumns = [
          "Firstname",
          "Surname",
          "email",
          "displayname",
          "dateofbirth",
          "KE",
          "Secondary",
          "mobile",
        ]
        const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
        }

        const parsedData = lines
          .slice(1)
          .map((row) => {
            if (!row.trim()) return null
            const values = row.split(",").map((value) => value.trim())
            return headers.reduce(
              (obj, header, index) => {
                obj[header] = values[index] || ""
                return obj
              },
              {} as Record<string, string>,
            )
          })
          .filter(Boolean)

        setCsvData(parsedData)
        toast({
          title: "CSV Loaded Successfully",
          description: `${parsedData.length} records loaded and ready to process.`,
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : "Please check your CSV format and try again.")
        toast({
          title: "Error Parsing CSV",
          description: error instanceof Error ? error.message : "Please check your CSV format and try again.",
          variant: "destructive",
        })
        setCsvData([])
      } finally {
        setIsLoading(false)
      }
    }

    reader.readAsText(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setCsvData([])
    setError(null)
    setShowResults(false)
    setProcessingResults(null)
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProcessData = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data to Process",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      })
      return
    }

    if (!settings.webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please configure the webhook URL in Settings.",
        variant: "destructive",
      })
      return
    }

    if (!settings.authToken) {
      toast({
        title: "Authentication Token Required",
        description: "Please configure the authentication token in Settings.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processCSV(csvData, settings.authToken, settings.webhookUrl)

      // Store the detailed results
      setProcessingResults(result)

      // Show the results view
      setShowResults(true)

      toast({
        title: "Data Processed",
        description: `${result.successCount} records processed. View the detailed results.`,
      })
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })

      // Set error results
      setProcessingResults({
        successCount: 0,
        failedCount: csvData.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        responses: [],
      })

      // Show the results view with errors
      setShowResults(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if webhook settings are configured
  const isWebhookConfigured = settings.webhookUrl && settings.authToken

  // If showing results, render the results component
  if (showResults && processingResults) {
    return (
      <ProcessingResults
        results={processingResults}
        totalRecords={csvData.length}
        onBack={() => setShowResults(false)}
        onRetry={handleProcessData}
      />
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ocean-800 mb-2">Upload CSV</h1>
        <p className="text-ocean-600">Upload and process your CSV data to send to the webhook.</p>
      </div>

      {!isWebhookConfigured && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Webhook Configuration Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            You need to configure your webhook URL and authentication token before processing data. You can do this in{" "}
            <Link href="/dashboard/settings" className="font-medium underline">
              Settings
            </Link>{" "}
            or use the quick setup below.
          </AlertDescription>
        </Alert>
      )}

      {!isWebhookConfigured && (
        <Card className="ocean-card bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
            <CardTitle className="text-ocean-700 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-ocean-500" />
              Quick Webhook Setup
            </CardTitle>
            <CardDescription className="text-ocean-600">
              Configure your webhook URL and authentication token
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="webhook-url" className="text-sm font-medium text-ocean-700">
                Webhook URL
              </label>
              <input
                id="webhook-url"
                type="text"
                value={quickWebhookUrl}
                onChange={(e) => setQuickWebhookUrl(e.target.value)}
                placeholder="https://your-webhook-url.onrender.com"
                className="w-full px-3 py-2 border border-ocean-200 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-ocean-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="auth-token" className="text-sm font-medium text-ocean-700">
                Authentication Token
              </label>
              <input
                id="auth-token"
                type="password"
                value={quickAuthToken}
                onChange={(e) => setQuickAuthToken(e.target.value)}
                placeholder="Your authentication token"
                className="w-full px-3 py-2 border border-ocean-200 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-ocean-400"
              />
            </div>
            <Button onClick={saveQuickSettings} className="bg-ocean-500 hover:bg-ocean-600 text-white">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="ocean-card bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
          <CardTitle className="text-ocean-700">Upload CSV File</CardTitle>
          <CardDescription className="text-ocean-600">
            CSV should contain columns: Firstname, Surname, email, displayname, dateofbirth, KE, Secondary, mobile
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-ocean-200 rounded-lg p-12 bg-ocean-50/50 hover:bg-ocean-50 transition-colors duration-200">
            <div className="w-16 h-16 mb-4 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-500 animate-pulse-slow">
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-ocean-700">Upload CSV File</h3>
              <p className="text-sm text-ocean-600 max-w-md">
                Select a CSV file with the required columns to upload and preview
              </p>
              <div className="mt-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />

                {/* Direct button to trigger file selection */}
                <Button
                  onClick={handleFileSelect}
                  className="bg-ocean-500 hover:bg-ocean-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Loading CSV...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Browse for CSV File
                    </>
                  )}
                </Button>
              </div>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-between w-full max-w-md bg-ocean-100/50 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-ocean-600" />
                  <p className="text-sm text-ocean-700 font-medium">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="h-8 w-8 p-0 text-ocean-500 hover:text-ocean-700 hover:bg-ocean-200/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error parsing CSV</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <div className="mt-6 wave-bg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-ocean-500 mr-2" />
                  <h3 className="text-lg font-semibold text-ocean-700">Data Preview</h3>
                </div>
                <p className="text-sm text-ocean-500">{csvData.length} records found</p>
              </div>
              <div className="border border-ocean-200 rounded-md max-h-[400px] overflow-auto bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ocean-50">
                      {Object.keys(csvData[0]).map((header) => (
                        <TableHead key={header} className="text-ocean-700">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-ocean-50/50">
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="text-ocean-600">
                            {value as string}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 5 && (
                  <div className="p-2 text-center text-sm text-ocean-500 bg-ocean-50/50 border-t border-ocean-100">
                    Showing 5 of {csvData.length} records
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-b-lg border-t border-ocean-200">
          <div>
            {!isWebhookConfigured && csvData.length > 0 && (
              <p className="text-sm text-amber-600">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Configure webhook settings to enable processing
              </p>
            )}
          </div>
          <Button
            onClick={handleProcessData}
            disabled={csvData.length === 0 || isProcessing || !settings.authToken || !settings.webhookUrl}
            className="bg-ocean-500 hover:bg-ocean-600 text-white flex items-center transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                Process and Send Data
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
