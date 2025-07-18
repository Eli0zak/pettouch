import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Brand-aligned minimalist line icons
const ReportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V11M12 15H12.01M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 8V6C7 5.46957 7.21071 4.96086 7.58579 4.58579C7.96086 4.21071 8.46957 4 9 4H11M7 16V18C7 18.5304 7.21071 19.0391 7.58579 19.4142C7.96086 19.7893 8.46957 20 9 20H11M17 8V6C17 5.46957 16.7893 4.96086 16.4142 4.58579C16.0391 4.21071 15.5304 4 15 4H13M17 16V18C17 18.5304 16.7893 19.0391 16.4142 19.4142C16.0391 19.7893 15.5304 20 15 20H13M5 12H19" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface QuickActionsBarProps {
  onReportLost: () => void;
  onScanTag: () => void;
  onAddRecord: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onReportLost, onScanTag, onAddRecord }) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center p-4 h-auto space-y-3 hover:scale-105 transition-all duration-200 hover:bg-primary/5 border-gray-200 hover:border-primary/20"
        onClick={onReportLost}
        aria-label="Report Lost"
      >
        <div className="text-[#FF9900]">
          <ReportIcon />
        </div>
        <span className="text-sm font-semibold text-[#2D2D2D] text-center font-ibm-plex">{t('quickActions.reportLost')}</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center p-4 h-auto space-y-3 hover:scale-105 transition-all duration-200 hover:bg-primary/5 border-gray-200 hover:border-primary/20"
        onClick={onScanTag}
        aria-label="Scan Tag"
      >
        <div className="text-[#6B4EFF]">
          <ScanIcon />
        </div>
        <span className="text-sm font-semibold text-[#2D2D2D] text-center font-ibm-plex">{t('quickActions.scanTag')}</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center p-4 h-auto space-y-3 hover:scale-105 transition-all duration-200 hover:bg-primary/5 border-gray-200 hover:border-primary/20"
        onClick={onAddRecord}
        aria-label="Add Record"
      >
        <div className="text-[#6B4EFF]">
          <AddIcon />
        </div>
        <span className="text-sm font-semibold text-[#2D2D2D] text-center font-ibm-plex">{t('quickActions.addRecord')}</span>
      </Button>
    </div>
  );
};

export default QuickActionsBar;
