import React from 'react';
import { Cake, PartyPopper } from 'lucide-react';
import { Card } from './card';

interface BirthdayCountdownProps {
  petName: string;
  birthday: string | null;
  onSelect?: () => void;
  isSelectable?: boolean;
}

const BirthdayCountdown: React.FC<BirthdayCountdownProps> = ({ 
  petName, 
  birthday, 
  onSelect,
  isSelectable = false 
}) => {
  if (!birthday) {
    return (
      <Card className="bg-[#F5F5F5] dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4 flex items-center gap-3">
          <Cake className="w-6 h-6 text-[#6B4EFF] flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-[#2D2D2D] dark:text-white font-inter mb-1 truncate">{petName}</div>
            <div className="text-sm text-[#2D2D2D] dark:text-gray-300 font-inter">Add {petName}&apos;s birthday for a fun countdown!</div>
          </div>
        </div>
      </Card>
    );
  }

  const today = new Date();
  const birthDate = new Date(birthday);
  const currentYear = today.getFullYear();

  // Calculate next birthday date
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // If birthday this year has passed, set to next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  // Calculate difference in days
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if birthday was within last 7 days
  const birthdayJustPassed = diffDays > 358; // More than 358 days means birthday was within last 7 days

  // Special states
  if (diffDays === 0) {
    return (
      <Card className="bg-[#F5F5F5] dark:bg-gray-800 hover:shadow-md transition-shadow border-[#FF9900] border-2">
        <div 
          className={`p-4 flex items-center gap-3 ${isSelectable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`} 
          onClick={onSelect}
        >
          <PartyPopper className="w-6 h-6 text-[#FF9900] flex-shrink-0 animate-bounce" />
          <div className="min-w-0">
            <div className="font-semibold text-[#2D2D2D] dark:text-white font-inter mb-1 truncate">{petName}</div>
            <div className="text-sm font-inter">
              <span className="text-[#FF9900] font-medium">🎉 Happy Birthday!</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (birthdayJustPassed) {
    return (
      <Card className="bg-[#F5F5F5] dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div 
          className={`p-4 flex items-center gap-3 ${isSelectable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`} 
          onClick={onSelect}
        >
          <PartyPopper className="w-6 h-6 text-[#6B4EFF] flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-[#2D2D2D] dark:text-white font-inter mb-1 truncate">{petName}</div>
            <div className="text-sm text-[#2D2D2D] dark:text-gray-300 font-inter">
              Hope {petName} had a great birthday!
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (diffDays <= 7) {
    return (
      <Card className="bg-[#F5F5F5] dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div 
          className={`p-4 flex items-center gap-3 ${isSelectable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`} 
          onClick={onSelect}
        >
          <Cake className="w-6 h-6 text-[#6B4EFF] flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-[#2D2D2D] dark:text-white font-inter mb-1 truncate">{petName}</div>
            <div className="text-sm font-inter">
              🎂 <span className="text-[#6B4EFF] font-medium">Birthday in {diffDays} day{diffDays > 1 ? 's' : ''}!</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#F5F5F5] dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div 
        className={`p-4 flex items-center gap-3 ${isSelectable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`} 
        onClick={onSelect}
      >
        <Cake className="w-6 h-6 text-[#6B4EFF] flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-[#2D2D2D] dark:text-white font-inter mb-1 truncate">{petName}</div>
          <div className="text-sm text-[#2D2D2D] dark:text-gray-300 font-inter">
            Next Birthday: {birthDate.toLocaleString('default', { month: 'long' })} {birthDate.getDate()} (in {diffDays} days)
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BirthdayCountdown;
