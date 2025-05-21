"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProcessingResultsProps {
  results: {
    successCount: number
    failedCount: number
    errors: string[]
    responses: any[]
  }
  totalRecords: number
  onBack: () => void
  onRetry: () => void
}

export default function ProcessingResults({ results, totalRecords, onBack, onRetry }: ProcessingResultsProps) {
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})
  const [expandedResponses, setExpandedResponses] = useState<Record<number, boolean>>({})

  const toggleError = (error: string) => {
    setExpandedErrors((prev) => ({
      ...prev,
      [error]: !prev[error],
    }))
  }

  const toggleResponse = (index: number) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const successRate = totalRecords > 0 ? Math.round((results.successCount / totalRecords) * 100) : 0
  const hasErrors = results.errors.length > 0 || results.failedCount > 0

  const exportResults = () => {
    const data = {
      summary: {
        totalRecords,
        successCount: results.successCount,
        failedCount: results.failedCount,
        successRate: `${successRate}%`,
      },
      errors: results.errors,
      responses: results.responses,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `processing-results-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-800 mb-2">Processing Results</h1>
          <p className="text-ocean-600">Review the results of your data processing</p>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>

      <Card className="ocean-card bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
          <CardTitle className="text-ocean-700">Processing Summary</CardTitle>
          <CardDescription className="text-ocean-600">Overview of the data processing results</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-ocean-50 p-4 rounded-lg">
              <p className="text-sm text-ocean-500 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-ocean-700">{totalRecords}</p>
            </div>
            <div className="bg-ocean-50 p-4 rounded-lg">
              <p className="text-sm text-ocean-500 mb-1">Successfully Processed</p>
              <p className="text-2xl font-bold text-green-600">{results.successCount}</p>
            </div>
            <div className="bg-ocean-50 p-4 rounded-lg">
              <p className="text-sm text-ocean-500 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{results.failedCount}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium text-ocean-700">Success Rate</p>
              <p className="text-sm font-medium text-ocean-700">{successRate}%</p>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>

          {hasErrors ? (
            <Alert className="bg-amber-50 border-amber-200 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Processing Completed with Errors</AlertTitle>
              <AlertDescription className="text-amber-700">
                Some records could not be processed. Review the errors below and retry if needed.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Processing Completed Successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                All records were processed successfully. You can view the responses below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-b-lg border-t border-ocean-200">
          <Button
            variant="outline"
            onClick={exportResults}
            className="border-ocean-200 hover:bg-ocean-100 text-ocean-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          {hasErrors && (
            <Button onClick={onRetry} className="bg-ocean-500 hover:bg-ocean-600 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Processing
            </Button>
          )}
        </CardFooter>
      </Card>

      <Tabs defaultValue={hasErrors ? "errors" : "responses"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger
            value="responses"
            className="data-[state=active]:bg-ocean-100 data-[state=active]:text-ocean-700"
          >
            Responses ({results.responses.length})
          </TabsTrigger>
          <TabsTrigger value="errors" className="data-[state=active]:bg-ocean-100 data-[state=active]:text-ocean-700">
            Errors ({results.errors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <Card className="ocean-card">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
              <CardTitle className="text-ocean-700">Webhook Responses</CardTitle>
              <CardDescription className="text-ocean-600">Responses received from the webhook</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {results.responses.length === 0 ? (
                <div className="text-center py-12 bg-ocean-50/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-400">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-ocean-700 mb-2">No responses available</h3>
                  <p className="text-ocean-500 max-w-md mx-auto">No responses were received from the webhook.</p>
                </div>
              ) : (
                <div className="border-b border-ocean-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ocean-50">
                        <TableHead className="text-ocean-700 w-[180px]">Timestamp</TableHead>
                        <TableHead className="text-ocean-700">Message</TableHead>
                        <TableHead className="text-ocean-700 w-[100px]">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.responses.map((response, index) => (
                        <TableRow key={index} className="hover:bg-ocean-50/50">
                          <TableCell className="text-ocean-600 whitespace-nowrap">
                            {response.timestamp || "N/A"}
                          </TableCell>
                          <TableCell className="text-ocean-600">{response.message || "No message"}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleResponse(index)}
                              className="h-8 w-8 p-0 text-ocean-500 hover:text-ocean-700 hover:bg-ocean-200/50"
                            >
                              {expandedResponses[index] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {results.responses.map(
                    (response, index) =>
                      expandedResponses[index] && (
                        <div key={`details-${index}`} className="p-4 bg-ocean-50/50 border-t border-ocean-100">
                          <h4 className="text-sm font-medium text-ocean-700 mb-2">Response Details</h4>
                          <pre className="text-xs overflow-auto max-h-[200px] p-3 bg-white rounded border border-ocean-200 text-ocean-700">
                            {JSON.stringify(response, null, 2)}
                          </pre>
                        </div>
                      ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card className="ocean-card">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
              <CardTitle className="text-ocean-700">Processing Errors</CardTitle>
              <CardDescription className="text-ocean-600">Errors encountered during processing</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {results.errors.length === 0 ? (
                <div className="text-center py-12 bg-ocean-50/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-ocean-700 mb-2">No errors</h3>
                  <p className="text-ocean-500 max-w-md mx-auto">All records were processed without errors.</p>
                </div>
              ) : (
                <div className="divide-y divide-ocean-100">
                  {results.errors.map((error, index) => (
                    <div key={index} className="p-4 hover:bg-ocean-50/50">
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-ocean-700">Error {index + 1}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleError(error)}
                              className="h-8 w-8 p-0 text-ocean-500 hover:text-ocean-700 hover:bg-ocean-200/50"
                            >
                              {expandedErrors[error] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            {expandedErrors[error]
                              ? error
                              : error.length > 100
                                ? `${error.substring(0, 100)}...`
                                : error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
