import React from 'react';
import { Star, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserStatsProps {
  totalPoints: number;
  currentStreak: number;
}

const UserStats: React.FC<UserStatsProps> = ({ totalPoints, currentStreak }) => {
  // Debug log
  console.log('[UserStats] Props:', { totalPoints, currentStreak });
  const safePoints = typeof totalPoints === 'number' && !isNaN(totalPoints) ? totalPoints : 0;
  const safeStreak = typeof currentStreak === 'number' && !isNaN(currentStreak) ? currentStreak : 0;

  return (
    <Card className="bg-gradient-to-r from-pet-accent1/10 to-pet-accent2/10">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Total Points</p>
            <p className="text-xl font-bold">{safePoints.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Current Streak</p>
            <p className="text-xl font-bold">{safeStreak} {safeStreak === 1 ? 'Day' : 'Days'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
