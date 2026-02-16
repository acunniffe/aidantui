export interface Contact {
  id: number;
  email: string | null;
  name: string;
  company: string | null;
  phone: string | null;
  slack_user_id: string | null;
  notes: string | null;
  merged_into: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSource {
  id: number;
  contact_id: number;
  source: string;
  source_id: string;
  first_seen: string;
}
