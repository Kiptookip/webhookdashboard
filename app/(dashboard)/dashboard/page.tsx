"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, MessageSquare, Users, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const [recentResponses, setRecentResponses] = useState<any[]>([])
  const [uploadCount, setUploadCount] = useState(0)
  const [recordsProcessed, setRecordsProcessed] = useState(0)
  const [successRate, setSuccessRate] = useState<number | null>(null)
  const { users } = useAuth()
  const userCount = users.length

  useEffect(() => {
    // Load responses from localStorage
    const storedResponses = localStorage.getItem("webhookResponses")
    if (storedResponses) {
      try {
        const parsedResponses = JSON.parse(storedResponses)
        setRecentResponses(parsedResponses.slice(0, 3)) // Get the 3 most recent responses

        // Calculate stats
        setUploadCount(Math.ceil(parsedResponses.length / 10)) // Estimate uploads based on responses
        setRecordsProcessed(parsedResponses.length)

        // Calculate success rate (assuming all stored responses are successful)
        if (parsedResponses.length > 0) {
          setSuccessRate(100)
        }
      } catch (error) {
        console.error("Failed to parse stored responses", error)
      }
    }
  }, [])

  const cards = [
    {
      title: "Upload CSV",
      description: "Upload and process CSV data to send to your webhook",
      icon: UploadCloud,
      href: "/dashboard/upload",
      color: "bg-gradient-to-br from-ocean-400 to-ocean-500",
    },
    {
      title: "View Responses",
      description: "View responses received from your webhook",
      icon: MessageSquare,
      href: "/dashboard/responses",
      color: "bg-gradient-to-br from-ocean-500 to-ocean-600",
    },
    {
      title: "Settings",
      description: "Configure webhook URLs and authentication tokens",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-gradient-to-br from-ocean-600 to-ocean-700",
    },
    {
      title: "User Management",
      description: "Manage users and their permissions",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-gradient-to-br from-ocean-700 to-ocean-800",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-800 mb-2">Dashboard</h1>
        <p className="text-ocean-600">Welcome to the CSV Webhook Portal. Select an option below to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Link href={card.href} key={index} className="group">
            <Card className="h-full ocean-card hover:shadow-lg transition-all duration-200 overflow-hidden group-hover:border-ocean-400">
              <div className={`h-2 ${card.color} w-full`}></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-ocean-700">
                  <card.icon className="h-5 w-5 mr-2 text-ocean-500" />
                  {card.title}
                </CardTitle>
                <CardDescription className="text-ocean-500">{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <ArrowRight className="h-5 w-5 text-ocean-400 group-hover:text-ocean-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="text-ocean-700">Recent Activity</CardTitle>
            <CardDescription className="text-ocean-500">Your recent actions in the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResponses.length > 0 ? (
                recentResponses.map((response, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-ocean-100 flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4 text-ocean-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ocean-700">Webhook Response</p>
                      <p className="text-xs text-ocean-500">{response.message || "Data processed"}</p>
                      <p className="text-xs text-ocean-400 mt-1">{response.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-ocean-500">No recent activity</p>
                  <p className="text-xs text-ocean-400 mt-1">Upload and process data to see activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="text-ocean-700">Quick Stats</CardTitle>
            <CardDescription className="text-ocean-500">Overview of your portal usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ocean-50 p-4 rounded-lg">
                <p className="text-xs text-ocean-500 mb-1">Total Uploads</p>
                <p className="text-2xl font-bold text-ocean-700">{uploadCount}</p>
              </div>
              <div className="bg-ocean-50 p-4 rounded-lg">
                <p className="text-xs text-ocean-500 mb-1">Records Processed</p>
                <p className="text-2xl font-bold text-ocean-700">{recordsProcessed}</p>
              </div>
              <div className="bg-ocean-50 p-4 rounded-lg">
                <p className="text-xs text-ocean-500 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-ocean-700">{successRate !== null ? `${successRate}%` : "N/A"}</p>
              </div>
              <div className="bg-ocean-50 p-4 rounded-lg">
                <p className="text-xs text-ocean-500 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-ocean-700">{userCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
