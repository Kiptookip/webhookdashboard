"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { processCSV } from "@/app/actions"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function CSVWebhookPortal() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated, otherwise to dashboard
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [user, router])

  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const rows = csvText.split("\n")
        const headers = rows[0].split(",").map((header) => header.trim())

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

        const parsedData = rows
          .slice(1)
          .map((row) => {
            if (!row.trim()) return null
            const values = row.split(",").map((value) => value.trim())
            return headers.reduce(
              (obj, header, index) => {
                obj[header] = values[index]
                return obj
              },
              {} as Record<string, string>,
            )
          })
          .filter(Boolean)

        setCsvData(parsedData)
        toast({
          title: "CSV Uploaded Successfully",
          description: `${parsedData.length} records loaded from CSV.`,
        })
      } catch (error) {
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

  const handleProcessData = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data to Process",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      })
      return
    }

    if (!authToken) {
      toast({
        title: "Authentication Token Required",
        description: "Please enter the authentication token.",
        variant: "destructive",
      })
      return
    }

    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter the webhook URL.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processCSV(csvData, authToken, webhookUrl)
      toast({
        title: "Data Processed Successfully",
        description: `${result.successCount} records sent to webhook.`,
      })

      if (result.responses.length > 0) {
        // Show the first few responses
        const responsePreview = result.responses
          .slice(0, 3)
          .map((r) => r.message)
          .join(", ")
        toast({
          title: "Webhook Responses",
          description: `Received ${result.responses.length} responses. First few: ${responsePreview}${result.responses.length > 3 ? "..." : ""}`,
        })
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return null // No need to render anything as we're redirecting
}
