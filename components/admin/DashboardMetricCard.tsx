
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
  trend: 'up' | 'down';
  loading?: boolean;
}

const DashboardMetricCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  trend,
  loading = false
}: DashboardMetricCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        
        {!loading && (
          <div className="flex items-center mt-4">
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{change}%</span>
            </div>
            <span className="text-xs text-muted-foreground ml-1.5">vs. last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;
