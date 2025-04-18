
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Camera, UserCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import type { Profile } from '@/types/profile';

export const ProfileSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
      return;
    }

    setProfile(data);
    setFullName(data.full_name || '');
  };

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Profile updated successfully' });
    await fetchProfile();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      await fetchProfile();
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-6 w-6" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={profile?.avatar_url || undefined} 
                alt={`${fullName}'s avatar`} 
              />
              <AvatarFallback>
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatarUpload"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <label 
              htmlFor="avatarUpload" 
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90"
              title="Change Avatar"
            >
              <Camera className="h-4 w-4" />
            </label>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
              <Button 
                onClick={updateProfile} 
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
