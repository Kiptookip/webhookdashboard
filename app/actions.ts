"use server"

interface CSVRecord {
  Firstname: string
  Surname: string
  email: string
  displayname: string
  dateofbirth: string
  KE: string
  Secondary: string
  mobile: string
  [key: string]: string
}

interface WebhookResponse {
  message: string
  [key: string]: any
}

interface ProcessResult {
  successCount: number
  failedCount: number
  errors: string[]
  responses: any[]
}

export async function processCSV(data: any[], authToken: string, webhookUrl: string): Promise<ProcessResult> {
  const result: ProcessResult = {
    successCount: 0,
    failedCount: 0,
    errors: [],
    responses: [],
  }

  // Track individual record errors
  const recordErrors: Record<number, string> = {}

  // Validate data format
  for (let i = 0; i < data.length; i++) {
    const record = data[i]

    if (!record.mobile) {
      const errorMsg = `Record ${i + 1}: Missing required field: mobile`
      result.errors.push(errorMsg)
      recordErrors[i] = errorMsg
      result.failedCount++
      continue
    }

    try {
      // Combine fields to create the message
      const message = `${record.Firstname || ""}, ${record.Surname || ""}, ${record.email || ""}, ${record.displayname || ""}, ${record.dateofbirth || ""}, ${record.KE || ""}, ${record.Secondary || ""}`

      // Format the data according to the required structure
      const formattedData = {
        shortcode: "22317",
        mobile: record.mobile,
        message: message,
      }

      // Send the data to the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Advanta-Token": authToken,
        },
        body: JSON.stringify(formattedData),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = { message: "No JSON response" }
      }

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`)
      }

      // Add timestamp to response
      const timestampedResponse = {
        ...responseData,
        timestamp: new Date().toLocaleString(),
        data: formattedData,
        message: responseData.message || `Processed ${record.Firstname} ${record.Surname}`,
        recordIndex: i,
      }

      result.responses.push(timestampedResponse)
      result.successCount++
    } catch (error) {
      result.failedCount++
      const errorMsg = `Record ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
      result.errors.push(errorMsg)
      recordErrors[i] = errorMsg
    }
  }

  // Store responses in localStorage (client-side will handle this)
  if (typeof window !== "undefined") {
    try {
      const storedResponses = localStorage.getItem("webhookResponses") || "[]"
      const parsedResponses = JSON.parse(storedResponses)
      const updatedResponses = [...result.responses, ...parsedResponses]
      localStorage.setItem("webhookResponses", JSON.stringify(updatedResponses))
    } catch (e) {
      console.error("Failed to store responses", e)
    }
  }

  return result
}
