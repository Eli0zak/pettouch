import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import QRCode from '@/components/ui/QRCode';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  petId: string;
}

export const QRCodeModal = ({ 
  isOpen, 
  onClose, 
  petName,
  petId 
}: QRCodeModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/pet/${petId}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: t("success"),
      description: t("dashboard.pets.success.copied"),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.pets.qrCode.title")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.pets.qrCode.description", { petName })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCode 
              value={`${window.location.origin}/pet/${petId}`}
              size={200}
              includeMargin
              level="H"
            />
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("dashboard.pets.qrCode.copyLink")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
