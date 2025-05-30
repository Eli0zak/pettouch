import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Calendar, File, Image, MapPin, MessageSquare, Settings } from 'lucide-react';

const FeaturesPage = () => {
  const featuresList = [
    {
      icon: <File className="h-10 w-10 text-pet-primary" />,
      title: "Comprehensive Pet Profiles",
      description: "Create detailed digital profiles for each of your pets, including photos, breed information, medical history, behavioral traits, dietary needs, and emergency contacts."
    },
    {
      icon: <Image className="h-10 w-10 text-pet-primary" />,
      title: "QR Code Integration",
      description: "Generate unique QR codes for your pets that link to their digital profiles. When scanned, these codes provide instant access to critical information for whoever finds your pet."
    },
    {
      icon: <MapPin className="h-10 w-10 text-pet-primary" />,
      title: "Scan History Tracking",
      description: "Monitor when and where your pet's QR code has been scanned, providing an additional layer of security and peace of mind when your pet is with others."
    },
    {
      icon: <Bell className="h-10 w-10 text-pet-primary" />,
      title: "Vaccination & Medication Reminders",
      description: "Set up customizable reminders for vaccinations, medications, grooming appointments, and other recurring pet care tasks to ensure you never miss an important date."
    },
    {
      icon: <Calendar className="h-10 w-10 text-pet-primary" />,
      title: "Health & Activity Logs",
      description: "Keep detailed records of vet visits, medications, exercise routines, dietary changes, and behavioral observations to monitor your pet's wellbeing over time."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-pet-primary" />,
      title: "Lost & Found Community",
      description: "Connect with a network of pet owners in your area to help locate missing pets. Post alerts, share sightings, and coordinate search efforts through our community platform."
    },
    {
      icon: <Settings className="h-10 w-10 text-pet-primary" />,
      title: "Pet Care Tips & Resources",
      description: "Access a library of expert-vetted articles, videos, and resources on pet health, training, nutrition, and behavior to help you provide the best care for your furry friends."
    }
  ];

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Our <span className="text-pet-primary">Features</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover all the ways PetTouch can help you manage your pet's health, safety, and wellbeing
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-12 mb-16">
        {featuresList.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-all border-pet-accent1">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start justify-center md:justify-start">
                  <div className="p-4 rounded-full bg-pet-accent1">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-pet-secondary">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-pet-accent1/30 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-pet-secondary">Coming Soon</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
          We're constantly working to improve PetTouch with new features and enhancements. 
          Stay tuned for upcoming additions including mobile apps, advanced analytics, and more!
        </p>
      </div>
    </div>
  );
};

export default FeaturesPage;
