"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ResponsesPage() {
  const [responses, setResponses] = useState<any[]>([])

  useEffect(() => {
    // Load responses from localStorage
    const storedResponses = localStorage.getItem("webhookResponses")
    if (storedResponses) {
      try {
        setResponses(JSON.parse(storedResponses))
      } catch (error) {
        console.error("Failed to parse stored responses", error)
      }
    }
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className="border-ocean-200 text-ocean-600 hover:bg-ocean-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
        </Link>
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-ocean-500 mr-2" />
          <h1 className="text-2xl font-bold text-ocean-700">Webhook Responses</h1>
        </div>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>

      <Card className="w-full ocean-card bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-t-lg border-b border-ocean-200">
          <CardTitle className="text-ocean-700">Response History</CardTitle>
          <CardDescription className="text-ocean-600">Responses received from your webhook</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {responses.length === 0 ? (
            <div className="text-center py-12 bg-ocean-50/30 rounded-lg border border-dashed border-ocean-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-400">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-ocean-700 mb-2">No responses yet</h3>
              <p className="text-ocean-500 max-w-md mx-auto">
                Process some data to see webhook responses here. All responses will be stored for your reference.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-auto border-ocean-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-ocean-50">
                    <TableHead className="text-ocean-700">Time</TableHead>
                    <TableHead className="text-ocean-700">Message</TableHead>
                    <TableHead className="text-ocean-700">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response, index) => (
                    <TableRow key={index} className="hover:bg-ocean-50/50">
                      <TableCell className="text-ocean-600">{response.timestamp}</TableCell>
                      <TableCell className="text-ocean-600">{response.message}</TableCell>
                      <TableCell>
                        <pre className="text-xs overflow-auto max-w-xs p-2 bg-ocean-50 rounded text-ocean-700">
                          {JSON.stringify(response.data, null, 2)}
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
