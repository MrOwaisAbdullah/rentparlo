'use client';

import React from 'react';
import { BarChart3, TrendingUp, Eye, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardChartProps {
  sellerId: string;
  period: string;
}

// Mock chart data - in real implementation, this would come from API
const generateMockData = (period: string) => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 50) + 10,
      contacts: Math.floor(Math.random() * 10) + 1,
      earnings: Math.floor(Math.random() * 5000) + 500
    });
  }
  
  return data;
};

export function DashboardChart({ sellerId, period }: DashboardChartProps) {
  const [activeTab, setActiveTab] = React.useState('views');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const chartData = React.useMemo(() => generateMockData(period), [period]);
  
  const maxViews = Math.max(...chartData.map(d => d.views));
  const maxContacts = Math.max(...chartData.map(d => d.contacts));
  const maxEarnings = Math.max(...chartData.map(d => d.earnings));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  const viewsTrend = calculateTrend(chartData.map(d => d.views));
  const contactsTrend = calculateTrend(chartData.map(d => d.contacts));
  const earningsTrend = calculateTrend(chartData.map(d => d.earnings));

  const BarChart = ({ data, maxValue, color, type }: {
    data: any[];
    maxValue: number;
    color: string;
    type: 'views' | 'contacts' | 'earnings';
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {period === '7d' ? 'Last 7 days' : 
           period === '30d' ? 'Last 30 days' : 
           period === '90d' ? 'Last 3 months' : 'Last year'}
        </span>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {type === 'views' ? viewsTrend.toFixed(1) : 
           type === 'contacts' ? contactsTrend.toFixed(1) : 
           earningsTrend.toFixed(1)}%
        </Badge>
      </div>
      
      <div className="h-64 flex items-end gap-1 p-4 bg-gray-50 rounded-lg">
        {data.map((item, index) => {
          const value = type === 'views' ? item.views : 
                      type === 'contacts' ? item.contacts : 
                      item.earnings;
          const height = (value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer relative min-h-[4px]`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${item.date}: ${
                  type === 'views' ? `${value} views` :
                  type === 'contacts' ? `${value} contacts` :
                  formatCurrency(value)
                }`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {type === 'views' ? `${value} views` :
                     type === 'contacts' ? `${value} contacts` :
                     formatCurrency(value)}
                    <div className="text-center">{item.date}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 transform rotate-45 origin-left">
                {data.length <= 7 ? item.date : 
                 index % Math.ceil(data.length / 7) === 0 ? item.date : ''}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold">
            {type === 'views' ? chartData.reduce((sum, d) => sum + d.views, 0) :
             type === 'contacts' ? chartData.reduce((sum, d) => sum + d.contacts, 0) :
             formatCurrency(chartData.reduce((sum, d) => sum + d.earnings, 0))}
          </div>
          <div className="text-muted-foreground">Total</div>
        </div>
        <div>
          <div className="font-semibold">
            {type === 'views' ? Math.round(chartData.reduce((sum, d) => sum + d.views, 0) / chartData.length) :
             type === 'contacts' ? Math.round(chartData.reduce((sum, d) => sum + d.contacts, 0) / chartData.length) :
             formatCurrency(Math.round(chartData.reduce((sum, d) => sum + d.earnings, 0) / chartData.length))}
          </div>
          <div className="text-muted-foreground">Average</div>
        </div>
        <div>
          <div className="font-semibold">
            {type === 'views' ? Math.max(...chartData.map(d => d.views)) :
             type === 'contacts' ? Math.max(...chartData.map(d => d.contacts)) :
             formatCurrency(Math.max(...chartData.map(d => d.earnings)))}
          </div>
          <div className="text-muted-foreground">Peak</div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="views" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Views
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <BarChart 
            data={chartData}
            maxValue={maxViews}
            color="bg-blue-500"
            type="views"
          />
        </TabsContent>

        <TabsContent value="contacts">
          <BarChart 
            data={chartData}
            maxValue={maxContacts}
            color="bg-green-500"
            type="contacts"
          />
        </TabsContent>

        <TabsContent value="earnings">
          <BarChart 
            data={chartData}
            maxValue={maxEarnings}
            color="bg-purple-500"
            type="earnings"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardChart;