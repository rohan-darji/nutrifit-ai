
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export interface Allergy {
  id: string;
  user_id: string;
  substance: string;
  severity: 'mild' | 'moderate' | 'severe';
  created_at: string;
}
