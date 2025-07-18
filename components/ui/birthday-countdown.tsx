import React from 'react';
import { Card } from './card';
import { Cake } from 'lucide-react';

interface BirthdayCountdownProps {
  petName: string;
  birthday: string | null;
}

const BirthdayCountdown: React.FC<BirthdayCountdownProps> = ({ petName, birthday }) => {
  if (!birthday) return null;

  const calculateDaysUntilBirthday = () => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntil = calculateDaysUntilBirthday();
  
  return (
    <div className="mt-2">
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Cake className="h-4 w-4" />
        {daysUntil === 0 ? (
          <span className="text-pet-primary font-medium">
            It's {petName}'s birthday today! 🎉
          </span>
        ) : (
          <span>
            {daysUntil} {daysUntil === 1 ? 'day' : 'days'} until {petName}'s birthday
          </span>
        )}
      </div>
    </div>
  );
};

export default BirthdayCountdown;
