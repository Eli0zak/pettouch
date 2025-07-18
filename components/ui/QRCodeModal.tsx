import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import QRCode from './QRCode';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ open, onOpenChange, value }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-lg p-6 bg-white relative">
        <AlertDialogHeader>
          <AlertDialogTitle>QR Code</AlertDialogTitle>
          <AlertDialogDescription>Scan this QR code to view the pet profile.</AlertDialogDescription>
          <AlertDialogCancel asChild>
            <button aria-label="Close" className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200">
              <X className="h-5 w-5" />
            </button>
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className="flex justify-center mt-4">
          <QRCode value={value} size={180} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QRCodeModal;
