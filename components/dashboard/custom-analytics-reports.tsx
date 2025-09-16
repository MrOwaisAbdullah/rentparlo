"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  BarChartHorizontal, 
  LineChart, 
  PieChart, 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Eye,
  Phone,
  Share2,
  Heart
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  Line, 
  LineChart as RechartsLineChart, 
  Pie, 
  PieChart as RechartsPieChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";

// Mock data for analytics reports
const mockTrafficData = [
  { date: "2023-01-01", views: 4000, contacts: 2400, whatsapp: 2400 },
  { date: "2023-01-02", views: 3000, contacts: 1398, whatsapp: 2210 },
  { date: "2023-01-03", views: 2000, contacts: 9800, whatsapp: 2290 },
  { date: "2023-01-04", views: 2780, contacts: 3908, whatsapp: 2000 },
  { date: "2023-01-05", views: 1890, contacts: 4800, whatsapp: 2181 },
  { date: "2023-01-06", views: 2390, contacts: 3800, whatsapp: 2500 },
  { date: "2023-01-07", views: 3490, contacts: 4300, whatsapp: 2100 },
];

const mockTopListings = [
  { name: "Toyota Camry 2020", views: 4000, contacts: 2400 },
  { name: "Honda Civic 2019", views: 3000, contacts: 1398 },
  { name: "Suzuki Mehran 2018", views: 2000, contacts: 9800 },
  { name: "Kia Sportage 2021", views: 2780, contacts: 3908 },
  { name: "Hyundai Elantra 2020", views: 1890, contacts: 4800 },
];

const mockGeographicData = [
  { name: "Karachi", value: 400 },
  { name: "Lahore", value: 300 },
  { name: "Islamabad", value: 200 },
  { name: "Rawalpindi", value: 150 },
  { name: "Faisalabad", value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CustomAnalyticsReportsProps {
  hasCustomAnalyticsReports: boolean;
  subscriptionName: string;
}

export function CustomAnalyticsReports({ 
  hasCustomAnalyticsReports,
  subscriptionName
}: CustomAnalyticsReportsProps) {
  if (!hasCustomAnalyticsReports) {
    return (
      <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Unlock Custom Analytics Reports
          </CardTitle>
          <CardDescription>
            Upgrade your plan to get detailed insights about your listings performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Our <Badge variant="secondary">Premium</Badge> and <Badge variant="secondary">Business</Badge> packages offer powerful analytics tools to help you grow your rental business. Track trends, understand your audience, and optimize your listings for maximum visibility.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2"><BarChartHorizontal className="w-4 h-4 text-green-500" /> Top Performing Listings</li>
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /> Geographic Distribution of Views</li>
                <li className="flex items-center gap-2"><LineChart className="w-4 h-4 text-green-500" /> Daily Performance Trends</li>
              </ul>
            </div>
            <div className="flex-shrink-0 text-center">
               <div className="mx-auto w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-md">
                 <TrendingUp className="w-10 h-10 text-primary" />
               </div>
              <Button>
                <a href="/dashboard/package">Upgrade Your Plan</a>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Starting from PKR 1,799/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Custom Analytics Reports
              </CardTitle>
              <CardDescription>
                Detailed insights for your {subscriptionName} package
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select defaultValue="7d">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-xl font-bold">24,568</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Clicks</p>
                    <p className="text-xl font-bold">1,243</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shares</p>
                    <p className="text-xl font-bold">856</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saves</p>
                    <p className="text-xl font-bold">1,024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traffic Overview</CardTitle>
                <CardDescription>Daily views, contacts, and WhatsApp clicks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={mockTrafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#0088FE" name="Views" />
                    <Line type="monotone" dataKey="contacts" stroke="#00C49F" name="Contacts" />
                    <Line type="monotone" dataKey="whatsapp" stroke="#FFBB28" name="WhatsApp" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Listings</CardTitle>
                <CardDescription>Your most viewed and contacted listings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={mockTopListings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#0088FE" name="Views" />
                    <Bar dataKey="contacts" fill="#00C49F" name="Contacts" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                <CardDescription>Views by city</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockGeographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockGeographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <CardDescription>Key metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Contact Rate</span>
                      <span className="text-sm text-muted-foreground">5.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "52%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Response Rate</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Listing Quality Score</span>
                      <span className="text-sm text-muted-foreground">92/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}