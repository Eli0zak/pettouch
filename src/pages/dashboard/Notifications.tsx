
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated on important pet events and reminders</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="mx-auto h-10 w-10 mb-4 text-gray-400" />
            <p>You don't have any notifications.</p>
            <p className="mt-2">Notifications about your pets, scan activity, and system updates will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
