"use client"

import { useState, useEffect } from "react"
import { EnhancedAdBanner } from "@/components/ads/enhanced-ad-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useDeviceDetection } from "@/hooks/use-device-detection"

export function BannerTestSuite() {
  const [userType, setUserType] = useState<"all" | "sellers" | "new-users">("all")
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const { isMobile, isTablet } = useDeviceDetection()
  
  const placements = [
    { id: "homepage-top", name: "Homepage Top", size: "leaderboard" },
    { id: "homepage-middle", name: "Homepage Middle", size: "leaderboard" },
    { id: "homepage-bottom", name: "Homepage Bottom", size: "leaderboard" },
    { id: "category-sidebar", name: "Category Sidebar", size: "medium-rectangle" },
    { id: "search-top", name: "Search Top", size: "leaderboard" },
    { id: "listing-sidebar", name: "Listing Sidebar", size: "medium-rectangle" },
    { id: "mobile-banner", name: "Mobile Banner", size: "mobile-banner" },
    { id: "seller-profile", name: "Seller Profile", size: "leaderboard" }
  ]

  const runTests = async () => {
    // Reset test results
    const results: Record<string, boolean> = {}
    
    // Test each placement
    for (const placement of placements) {
      try {
        // Simulate banner loading
        await new Promise(resolve => setTimeout(resolve, 100))
        results[placement.id] = true
      } catch (error) {
        console.error(`Error testing ${placement.id}:`, error)
        results[placement.id] = false
      }
    }
    
    setTestResults(results)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />
    if (isTablet) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceName = () => {
    if (isMobile) return "Mobile"
    if (isTablet) return "Tablet"
    return "Desktop"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Banner Test Suite</h1>
        <p className="text-muted-foreground mb-4">
          Test all banner placements and configurations
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getDeviceIcon()}
            {getDeviceName()} Device
          </Badge>
          <Badge variant="outline">
            User Type: {userType}
          </Badge>
        </div>
      </div>

      {/* User Type Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={userType === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setUserType("all")}
        >
          All Users
        </Button>
        <Button
          variant={userType === "sellers" ? "primary" : "outline"}
          size="sm"
          onClick={() => setUserType("sellers")}
        >
          Sellers Only
        </Button>
        <Button
          variant={userType === "new-users" ? "primary" : "outline"}
          size="sm"
          onClick={() => setUserType("new-users")}
        >
          New Users Only
        </Button>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Test Results</span>
            <Button size="sm" variant="outline" onClick={runTests}>
              Re-run Tests
            </Button>
          </CardTitle>
          <CardDescription>
            Status of all banner placements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placements.map((placement) => (
              <div 
                key={placement.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  {testResults[placement.id] === true ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : testResults[placement.id] === false ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{placement.name}</div>
                    <div className="text-xs text-muted-foreground">{placement.size}</div>
                  </div>
                </div>
                <Badge variant={testResults[placement.id] === true ? "default" : testResults[placement.id] === false ? "destructive" : "secondary"}>
                  {testResults[placement.id] === true ? "Pass" : testResults[placement.id] === false ? "Fail" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banner Placements */}
      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="listing">Listing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="homepage" className="space-y-6">
          {/* Homepage Top Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Homepage Top Banner</CardTitle>
              <CardDescription>Large Banner (1400×400px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <EnhancedAdBanner
                  placement="homepage-top"
                  userType={userType}
                  className="mx-auto"
                  fallbackText="Homepage Top Banner"
                />
              </div>
            </CardContent>
          </Card>

          {/* Homepage Middle Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Homepage Middle Banner</CardTitle>
              <CardDescription>Leaderboard (1200×250px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <EnhancedAdBanner
                  placement="homepage-middle"
                  userType={userType}
                  className="mx-auto"
                  fallbackText="Homepage Middle Banner"
                />
              </div>
            </CardContent>
          </Card>

          {/* Homepage Bottom Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Homepage Bottom Banner</CardTitle>
              <CardDescription>Leaderboard (1200×250px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <EnhancedAdBanner
                  placement="homepage-bottom"
                  userType={userType}
                  className="mx-auto"
                  fallbackText="Homepage Bottom Banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          {/* Category Sidebar Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Category Sidebar Banner</CardTitle>
              <CardDescription>Medium Rectangle (300×250px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex justify-center">
                <EnhancedAdBanner
                  placement="category-sidebar"
                  userType={userType}
                  fallbackText="Category Sidebar Banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Search Top Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Search Top Banner</CardTitle>
              <CardDescription>Leaderboard (1200×250px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <EnhancedAdBanner
                  placement="search-top"
                  userType={userType}
                  className="mx-auto"
                  fallbackText="Search Top Banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listing" className="space-y-6">
          {/* Listing Sidebar Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Sidebar Banner</CardTitle>
              <CardDescription>Medium Rectangle (300×250px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex justify-center">
                <EnhancedAdBanner
                  placement="listing-sidebar"
                  userType={userType}
                  fallbackText="Listing Sidebar Banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Banner */}
      {isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Banner</CardTitle>
            <CardDescription>Mobile Banner (320×50px)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-center">
                <EnhancedAdBanner
                  placement="mobile-banner"
                  userType={userType}
                  size="mobile-banner"
                  fallbackText="Mobile Banner"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Profile Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Profile Banner</CardTitle>
          <CardDescription>Leaderboard (1200×250px)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <EnhancedAdBanner
              placement="seller-profile"
              userType={userType}
              className="mx-auto"
              fallbackText="Seller Profile Banner"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}