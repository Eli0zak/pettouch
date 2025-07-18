import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'Q',
  includeMargin = false,
}) => {
  return (
    <QRCodeCanvas
      value={value}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      level={level}
      includeMargin={includeMargin}
    />
  );
};

export default QRCode;
