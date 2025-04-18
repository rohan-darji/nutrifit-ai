
import React from 'react';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { AllergiesSection } from '@/components/profile/AllergiesSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <ProfileSection />
          <AllergiesSection />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
