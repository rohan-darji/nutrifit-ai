import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield, UserCircle, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import type { Profile, Allergy } from '@/types/profile';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState({ substance: '', severity: 'mild' as 'mild' | 'moderate' | 'severe' });
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAllergies();
    }
  }, [user]);

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

  const fetchAllergies = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to load allergies', variant: 'destructive' });
      return;
    }

    const typedAllergies = data?.map(allergy => ({
      ...allergy,
      severity: allergy.severity as 'mild' | 'moderate' | 'severe'
    })) || [];
    
    setAllergies(typedAllergies);
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

  return (
    <div className="container mx-auto p-4 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Manage Allergies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAllergy.substance}
              onChange={(e) => setNewAllergy({ ...newAllergy, substance: e.target.value })}
              placeholder="Enter allergy substance"
            />
            <Select
              value={newAllergy.severity}
              onValueChange={(value) => setNewAllergy({ ...newAllergy, severity: value as 'mild' | 'moderate' | 'severe' })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addAllergy}>Add Allergy</Button>
          </div>

          {allergies.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              No allergies added yet
            </div>
          ) : (
            <div className="grid gap-2">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                  <div>
                    <span className="font-medium">{allergy.substance}</span>
                    <span className="ml-2 text-sm text-muted-foreground">({allergy.severity})</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeAllergy(allergy.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
