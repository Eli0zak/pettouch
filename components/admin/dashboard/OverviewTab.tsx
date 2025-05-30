import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardChart } from './DashboardCharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardData {
  petTypeDistribution: { name: string, value: number }[];
  planDistribution: { name: string, value: number }[];
  monthlyScans: { month: string, scans: number }[];
  monthlyUsers: { month: string, users: number }[];
  monthlyOrders: { month: string, orders: number }[];
  lostFoundStatusDistribution: { name: string, value: number }[];
}

interface OverviewTabProps {
  loading: boolean;
  dashboardData: DashboardData;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ loading, dashboardData }) => {
  // Create combined data for the bar chart
  const combinedMonthlyData = dashboardData.monthlyUsers.map((item, index) => ({
    month: item.month,
    users: item.users,
    orders: dashboardData.monthlyOrders[index]?.orders || 0
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardChart
          data={dashboardData.petTypeDistribution}
          loading={loading}
          title="Pet Type Distribution"
          description="Types of pets registered on the platform"
          type="pie"
        />
        
        <DashboardChart
          data={dashboardData.planDistribution}
          loading={loading}
          title="User Plan Distribution"
          description="Breakdown of subscription plans"
          type="pie"
        />

        <DashboardChart
          data={dashboardData.monthlyScans}
          loading={loading}
          title="Monthly Pet Tag Scans"
          description="Tag scan activity over time"
          type="line"
          dataKey="scans"
        />
        
        <DashboardChart
          data={dashboardData.lostFoundStatusDistribution}
          loading={loading}
          title="Lost & Found Report Status"
          description="Status of lost & found reports"
          type="pie"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Monthly growth of users, pets and orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pet-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={combinedMonthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" name="Users" fill="#8884d8" />
                <Bar dataKey="orders" name="Orders" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
