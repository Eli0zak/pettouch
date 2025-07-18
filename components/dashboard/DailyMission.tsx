import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyMissionProps {
  currentStreak: number;
  hasCompletedDaily: boolean;
}

const DailyMission: React.FC<DailyMissionProps> = ({ currentStreak, hasCompletedDaily }) => {
  const navigate = useNavigate();

  const getStreakMessage = () => {
    if (hasCompletedDaily) {
      return "Great job! Come back tomorrow for more points!";
    }
    if (currentStreak === 0) {
      return "Start your streak today!";
    }
    return `You're on a ${currentStreak}-day streak! Keep it going!`;
  };

  return (
    <Card className="bg-gradient-to-br from-pet-primary/5 to-pet-accent1/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-pet-primary" />
          <CardTitle className="text-lg">Your Daily Mission</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{getStreakMessage()}</p>
        
        {!hasCompletedDaily && (
          <div className="bg-white/50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium">Today's Task:</p>
            <p className="text-sm text-gray-600">Read today's featured tip to earn 10 points and maintain your streak!</p>
          </div>
        )}

        <Button 
          className="w-full group"
          variant={hasCompletedDaily ? "outline" : "default"}
          onClick={() => navigate('/dashboard/tips')}
          disabled={hasCompletedDaily}
        >
          {hasCompletedDaily ? 'Completed for Today' : "Read Today's Tip"}
          {!hasCompletedDaily && (
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyMission;
