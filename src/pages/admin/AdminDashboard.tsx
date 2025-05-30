
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dashboard components and utility functions
import DashboardMetricCard from '@/components/admin/DashboardMetricCard';
import { OverviewTab } from '@/components/admin/dashboard/OverviewTab';
import { UsersTab } from '@/components/admin/dashboard/UsersTab';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { Users, Tag, Newspaper, ShoppingBag } from 'lucide-react';

const AdminDashboard = () => {
  const { loading, dashboardData } = useAdminDashboard();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard 
          title="Total Users"
          value={dashboardData.userCount}
          icon={<Users className="h-5 w-5" />}
          change={dashboardData.userGrowth}
          trend={dashboardData.userGrowth >= 0 ? "up" : "down"}
          loading={loading}
        />
        <DashboardMetricCard 
          title="Registered Pets"
          value={dashboardData.petCount}
          icon={<Tag className="h-5 w-5" />}
          change={dashboardData.petGrowth}
          trend={dashboardData.petGrowth >= 0 ? "up" : "down"}
          loading={loading}
        />
        <DashboardMetricCard 
          title="Lost & Found Reports"
          value={dashboardData.lostFoundCount}
          icon={<Newspaper className="h-5 w-5" />}
          change={dashboardData.lostFoundGrowth}
          trend={dashboardData.lostFoundGrowth >= 0 ? "up" : "down"}
          loading={loading}
        />
        <DashboardMetricCard 
          title="Store Orders"
          value={dashboardData.orderCount}
          icon={<ShoppingBag className="h-5 w-5" />}
          change={dashboardData.orderGrowth}
          trend={dashboardData.orderGrowth >= 0 ? "up" : "down"}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
          <TabsTrigger value="lostfound">Lost & Found</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab loading={loading} dashboardData={dashboardData} />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersTab loading={loading} monthlyUsers={dashboardData.monthlyUsers} />
        </TabsContent>
        
        {/* Additional tab contents would go here */}
        <TabsContent value="pets">
          <div className="text-center py-8 text-muted-foreground">
            Pet statistics dashboard coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="lostfound">
          <div className="text-center py-8 text-muted-foreground">
            Lost & Found statistics dashboard coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="text-center py-8 text-muted-foreground">
            Orders statistics dashboard coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
