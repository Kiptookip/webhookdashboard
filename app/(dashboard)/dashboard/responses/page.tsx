"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Download, Search, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Response {
  timestamp: string
  message: string
  data: any
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([])
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load responses from localStorage
    const storedResponses = localStorage.getItem("webhookResponses")
    if (storedResponses) {
      try {
        const parsed = JSON.parse(storedResponses)
        setResponses(parsed)
        setFilteredResponses(parsed)
      } catch (error) {
        console.error("Failed to parse stored responses", error)
        setResponses([])
        setFilteredResponses([])
      }
    } else {
      setResponses([])
      setFilteredResponses([])
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = responses.filter(
        (response) =>
          response.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(response.data).toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredResponses(filtered)
    } else {
      setFilteredResponses(responses)
    }
  }, [searchTerm, responses])

  const handleExportCSV = () => {
    if (filteredResponses.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no responses to export",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["Timestamp", "Message", "Data"]
    const csvRows = [
      headers.join(","),
      ...filteredResponses.map((response) => {
        return [
          `"${response.timestamp || ""}"`,
          `"${(response.message || "").replace(/"/g, '""')}"`,
          `"${JSON.stringify(response.data || {}).replace(/"/g, '""')}"`,
        ].join(",")
      }),
    ]
    const csvContent = csvRows.join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `webhook-responses-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${filteredResponses.length} responses exported to CSV`,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ocean-800 mb-2">Webhook Responses</h1>
        <p className="text-ocean-600">View and manage responses received from your webhook.</p>
      </div>

      <Card className="ocean-card bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-ocean-700">
                <MessageSquare className="h-5 w-5 mr-2 text-ocean-500" />
                Response History
              </CardTitle>
              <CardDescription className="text-ocean-500">
                {filteredResponses.length} responses received from your webhook
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ocean-400" />
                <Input
                  placeholder="Search responses..."
                  className="pl-9 border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300 w-full sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="border-ocean-200 hover:bg-ocean-100 text-ocean-700"
                onClick={handleExportCSV}
                disabled={filteredResponses.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="border-red-200 hover:bg-red-50 text-red-600"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all responses? This cannot be undone.")) {
                    localStorage.removeItem("webhookResponses")
                    setResponses([])
                    setFilteredResponses([])
                    toast({
                      title: "Responses Cleared",
                      description: "All webhook responses have been cleared",
                    })
                  }
                }}
                disabled={responses.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredResponses.length === 0 ? (
            <div className="text-center py-12 bg-ocean-50/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-400">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-ocean-700 mb-2">No responses yet</h3>
              <p className="text-ocean-500 max-w-md mx-auto">
                {searchTerm
                  ? "No responses match your search criteria."
                  : "Process some data to see webhook responses here."}
              </p>
            </div>
          ) : (
            <div className="border-b border-ocean-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-ocean-50">
                    <TableHead className="text-ocean-700 w-[180px]">Timestamp</TableHead>
                    <TableHead className="text-ocean-700">Message</TableHead>
                    <TableHead className="text-ocean-700 w-[300px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response, index) => (
                    <TableRow key={index} className="hover:bg-ocean-50/50">
                      <TableCell className="text-ocean-600 whitespace-nowrap">{response.timestamp}</TableCell>
                      <TableCell className="text-ocean-600">{response.message || "No message"}</TableCell>
                      <TableCell>
                        <pre className="text-xs overflow-auto max-h-[100px] p-2 bg-ocean-50 rounded text-ocean-700">
                          {JSON.stringify(response.data || {}, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
