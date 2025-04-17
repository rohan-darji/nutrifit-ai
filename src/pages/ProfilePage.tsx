
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield, UserCircle } from 'lucide-react';
import type { Profile, Allergy } from '@/types/profile';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState({ substance: '', severity: 'mild' });
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

    setAllergies(data || []);
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

  const addAllergy = async () => {
    if (!user || !newAllergy.substance) return;
    const { error } = await supabase
      .from('allergies')
      .insert([{
        user_id: user.id,
        substance: newAllergy.substance,
        severity: newAllergy.severity
      }]);

    if (error) {
      toast({ 
        title: 'Error', 
        description: error.message === 'duplicate key value violates unique constraint' 
          ? 'This allergy is already added'
          : 'Failed to add allergy',
        variant: 'destructive'
      });
      return;
    }

    toast({ title: 'Success', description: 'Allergy added successfully' });
    setNewAllergy({ substance: '', severity: 'mild' });
    await fetchAllergies();
  };

  const removeAllergy = async (id: string) => {
    const { error } = await supabase
      .from('allergies')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove allergy', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Allergy removed successfully' });
    await fetchAllergies();
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
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
              <Button onClick={updateProfile}>Update Profile</Button>
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
