import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LearnMore = () => {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        <span className="bg-gradient-to-r from-pet-primary to-pet-secondary bg-clip-text text-transparent">
          All About PetTouch
        </span>
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-12">
        <section className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-pet-primary">What is PetTouch?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            PetTouch is a comprehensive pet management platform that helps you keep track of all aspects of your pet's life.
            From health records and vaccination schedules to lost and found features, PetTouch simplifies pet ownership
            and ensures your furry friends receive the best care possible.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Pet Profiles</h3>
              <p className="text-gray-600">Create detailed profiles for all your pets, including medical history, dietary requirements, and more.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Vaccination Tracking</h3>
              <p className="text-gray-600">Never miss an important vaccine with our reminder system.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">QR Code Tags</h3>
              <p className="text-gray-600">Generate QR codes for pet tags that link directly to their profiles.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Lost & Found</h3>
              <p className="text-gray-600">Community features to help reunite lost pets with their owners.</p>
            </div>
          </div>
        </section>
        
        <section className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-pet-primary">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex gap-2 items-start">
              <div className="bg-pet-accent1 text-pet-primary p-1 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Secure digital storage of pet information</span>
            </li>
            <li className="flex gap-2 items-start">
              <div className="bg-pet-accent1 text-pet-primary p-1 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Quick access to critical health information during emergencies</span>
            </li>
            <li className="flex gap-2 items-start">
              <div className="bg-pet-accent1 text-pet-primary p-1 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Community-powered lost and found system</span>
            </li>
            <li className="flex gap-2 items-start">
              <div className="bg-pet-accent1 text-pet-primary p-1 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Daily pet care tips and advice from experts</span>
            </li>
            <li className="flex gap-2 items-start">
              <div className="bg-pet-accent1 text-pet-primary p-1 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Customizable reminder system for vaccinations and medications</span>
            </li>
          </ul>
        </section>
        
        <div className="text-center">
          <Link to="/auth">
            <Button className="bg-pet-primary hover:bg-pet-secondary text-white px-8 py-6 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
