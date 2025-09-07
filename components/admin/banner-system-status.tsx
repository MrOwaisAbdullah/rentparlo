"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'error'
  error?: string
  result?: any
}

interface BannerSystemStatus {
  success: boolean
  status: 'healthy' | 'issues_detected' | 'error'
  tests: TestResult[]
  timestamp: string
}

export function BannerSystemStatus() {
  const [status, setStatus] = useState<BannerSystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("/api/test/banners")
        const data: BannerSystemStatus = await response.json()
        
        setStatus(data)
      } catch (err) {
        console.error("Error fetching banner system status:", err)
        setError("Failed to fetch banner system status")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const getStatusIcon = (status: 'pass' | 'fail' | 'error') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: 'pass' | 'fail' | 'error') => {
    switch (status) {
      case 'pass':
        return "bg-green-100 text-green-800"
      case 'fail':
        return "bg-red-100 text-red-800"
      case 'error':
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Banner System Status
          </CardTitle>
          <CardDescription>
            Checking banner system components...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Banner System Status
          </CardTitle>
          <CardDescription>
            Error checking banner system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            {error || "Failed to load banner system status"}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.status === 'healthy' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status.status === 'issues_detected' ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Banner System Status
        </CardTitle>
        <CardDescription>
          {status.status === 'healthy' 
            ? "All banner system components are working correctly" 
            : status.status === 'issues_detected'
            ? "Some banner system components have issues"
            : "Banner system has critical issues"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            {status.tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="text-sm font-medium">{test.name}</span>
                </div>
                <Badge className={getStatusColor(test.status)}>
                  {test.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
          
          {status.tests.some(test => test.error) && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Errors:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {status.tests
                  .filter(test => test.error)
                  .map((test, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="font-medium">{test.name}:</span>
                      <span>{test.error}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last checked: {new Date(status.timestamp).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}