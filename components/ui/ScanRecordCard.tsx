import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScanRecordCardProps {
  id: string;
  petName: string;
  petImage: string | null;
  timestamp: Date;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  onClick: (scanId: string) => void;
}

const ScanRecordCard: React.FC<ScanRecordCardProps> = ({
  id,
  petName,
  petImage,
  timestamp,
  location,
  coordinates,
  onClick
}) => {
  const { t, i18n } = useTranslation();

  // Format date and time based on current language
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Determine location display
  const getLocationDisplay = () => {
    if (!location || location === 'Unknown' || location === 'غير معروف') {
      return null; // Don't show location if unknown
    }
    
    // If we have coordinates, show full address
    if (coordinates) {
      return t('scanHistory.card.fromLocation', { location });
    }
    
    // If we only have city/country from IP, show that
    return t('scanHistory.card.fromLocation', { location });
  };

  const locationDisplay = getLocationDisplay();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-gray-50/50 border border-gray-200 rounded-xl"
      onClick={() => onClick(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Pet Name */}
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {t('scanHistory.card.wasScanned', { petName })}
              </h3>
              
              {/* Date & Time */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                <span className="mr-3 rtl:ml-3 rtl:mr-0">{formatDate(timestamp)}</span>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                <span>{formatTime(timestamp)}</span>
              </div>
              
              {/* Location (only if available) */}
              {locationDisplay && (
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  <span className="truncate">{locationDisplay}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Indicator */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0 ml-3 rtl:mr-3 rtl:ml-0">
            <span className="text-xs sm:text-sm text-blue-600 font-medium hidden sm:inline">
              {t('scanHistory.card.viewDetails')}
            </span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanRecordCard;
