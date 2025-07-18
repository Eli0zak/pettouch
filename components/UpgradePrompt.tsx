import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface UpgradePromptProps {
  maxPets: number;
  currentPlan: string;
  onClose: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ maxPets, currentPlan, onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleUpgradeClick = () => {
    onClose();
    navigate('/dashboard/subscription');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{t('upgradePrompt.title')}</h2>
        <p className="mb-4">
          {t('upgradePrompt.limitMessage', { maxPets, currentPlan })}
        </p>
        <p className="mb-6">
          {t('upgradePrompt.upgradeMessage')}
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            {t('upgradePrompt.cancel')}
          </Button>
          <Button onClick={handleUpgradeClick} className="bg-primary text-white hover:bg-primary-dark">
            {t('upgradePrompt.upgradeButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
