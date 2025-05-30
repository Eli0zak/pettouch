
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PetCareTips = () => {
  const tipCategories = [
    "Nutrition", "Grooming", "Training", "Health", "Safety"
  ];

  const featuredTips = [
    {
      title: "Essential Nutrition Tips",
      category: "Nutrition",
      description: "Learn about balanced diets for different pets and ages.",
      imageUrl: "/placeholder.svg"
    },
    {
      title: "Grooming Basics",
      category: "Grooming",
      description: "Regular grooming practices for a healthy, happy pet.",
      imageUrl: "/placeholder.svg"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pet Care Tips</h1>
        <p className="text-gray-600">Expert advice for keeping your pets happy and healthy</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="outline" className="rounded-full bg-pet-accent1/10">All</Button>
        {tipCategories.map(category => (
          <Button key={category} variant="outline" className="rounded-full">
            {category}
          </Button>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mb-4">Featured Tips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredTips.map((tip, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 bg-gray-200">
              <img 
                src={tip.imageUrl} 
                alt={tip.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-pet-accent1/20 text-pet-primary text-xs px-2 py-1 rounded-full">
                  {tip.category}
                </span>
              </div>
              <CardTitle className="text-lg">{tip.title}</CardTitle>
              <CardDescription>{tip.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full">Read More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {featuredTips.length === 0 && (
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-10 w-10 mb-4 text-gray-400" />
            <p className="text-gray-500">No tips available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for helpful pet care advice!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PetCareTips;
