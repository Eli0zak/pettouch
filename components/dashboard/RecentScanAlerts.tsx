import React from 'react';
import { Button } from '@/components/ui/button';

const RecentScanAlerts: React.FC<{
  scans?: {
    id: string;
    petName: string;
    location?: string;
    date: string;
    time: string;
    mapImageUrl?: string;
  }[];
  onViewAllScans: () => void;
}> = ({ scans, onViewAllScans }) => {
  const safeScans = Array.isArray(scans) ? scans : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Scan Alerts</h2>
      <ul className="space-y-3">
        {safeScans.slice(0, 3).map((scan) => (
          <li key={scan.id} className="border rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm">
                <strong>{scan.petName}</strong> was scanned near {scan.location || 'an unknown location'} on {scan.date} at {scan.time}.
              </p>
              {scan.mapImageUrl && (
                <img 
                  src={scan.mapImageUrl} 
                  alt={`Map for scan ${scan.id}`} 
                  className="mt-2 w-full max-w-xs rounded"
                />
              )}
            </div>
            <div className="mt-2 sm:mt-0">
              <Button variant="outline" size="sm" onClick={onViewAllScans}>
                View All Scans
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {safeScans.length === 0 && (
        <p className="text-gray-500 text-sm">No recent scans available.</p>
      )}
    </div>
  );
};

export default RecentScanAlerts;
