
import React from 'react';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { AllergiesSection } from '@/components/profile/AllergiesSection';

const ProfilePage = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <ProfileSection />
      <AllergiesSection />
    </div>
  );
};

export default ProfilePage;
