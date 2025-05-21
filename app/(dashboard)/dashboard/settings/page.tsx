"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Waves, Key, Save } from "lucide-react"
import { useSettings } from "@/lib/settings-context"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || "")
  const [authToken, setAuthToken] = useState(settings.authToken || "")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setWebhookUrl(settings.webhookUrl || "")
    setAuthToken(settings.authToken || "")
  }, [settings])

  const handleSaveSettings = () => {
    setIsSaving(true)

    setTimeout(() => {
      updateSettings({
        webhookUrl,
        authToken,
      })

      toast({
        title: "Settings Saved",
        description: "Your webhook settings have been updated successfully",
      })

      setIsSaving(false)
    }, 500) // Simulate a short delay for better UX
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ocean-800 mb-2">Settings</h1>
        <p className="text-ocean-600">Configure your webhook URL and authentication token.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center text-ocean-700">
              <Waves className="h-5 w-5 mr-2 text-ocean-500" />
              Webhook Configuration
            </CardTitle>
            <CardDescription className="text-ocean-500">
              Set up your webhook endpoint and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-ocean-700">
                Webhook URL
              </Label>
              <Input
                id="webhook-url"
                placeholder="https://your-webhook-url.onrender.com"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
              />
              <p className="text-sm text-ocean-500">Enter the URL of your Render webhook</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-token" className="text-ocean-700">
                Authentication Token
              </Label>
              <div className="flex">
                <Input
                  id="auth-token"
                  placeholder="Paste your authentication token here"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  type="password"
                  className="flex-1 border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 border-ocean-200 hover:bg-ocean-100 hover:text-ocean-700"
                  onClick={() => {
                    navigator.clipboard
                      .readText()
                      .then((text) => {
                        setAuthToken(text)
                        toast({
                          title: "Token Pasted",
                          description: "Authentication token pasted from clipboard",
                        })
                      })
                      .catch(() => {
                        toast({
                          title: "Paste Failed",
                          description: "Could not paste from clipboard",
                          variant: "destructive",
                        })
                      })
                  }}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-ocean-500">This will be sent as the X-Advanta-Token header</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-ocean-500 hover:bg-ocean-600 text-white"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="text-ocean-700">Settings Information</CardTitle>
            <CardDescription className="text-ocean-500">How your settings are used in the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-ocean-50 p-4 rounded-lg">
              <h3 className="font-medium text-ocean-700 mb-2">Webhook URL</h3>
              <p className="text-sm text-ocean-600">
                The webhook URL is the endpoint where your data will be sent. This should be the URL of your Render
                webhook.
              </p>
            </div>

            <div className="bg-ocean-50 p-4 rounded-lg">
              <h3 className="font-medium text-ocean-700 mb-2">Authentication Token</h3>
              <p className="text-sm text-ocean-600">
                The authentication token is sent with each request as the X-Advanta-Token header. This is used to
                authenticate your requests to the webhook.
              </p>
            </div>

            <div className="bg-ocean-50 p-4 rounded-lg">
              <h3 className="font-medium text-ocean-700 mb-2">Data Format</h3>
              <p className="text-sm text-ocean-600">Each record from your CSV will be formatted as:</p>
              <pre className="mt-2 text-xs bg-white p-2 rounded border border-ocean-200 overflow-x-auto">
                {`{
  "shortcode": "22317",
  "mobile": "+2547XXXXXXXX",
  "message": "Firstname, Surname, email, displayname, dateofbirth, KE, Secondary"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
