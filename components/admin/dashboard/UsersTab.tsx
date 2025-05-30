
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardChart } from './DashboardCharts';

interface UsersTabProps {
  loading: boolean;
  monthlyUsers: { month: string, users: number }[];
}

export const UsersTab: React.FC<UsersTabProps> = ({ loading, monthlyUsers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Monthly user registration trend</CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardChart
          data={monthlyUsers}
          loading={loading}
          title=""
          description=""
          type="line"
          dataKey="users"
        />
      </CardContent>
    </Card>
  );
};
