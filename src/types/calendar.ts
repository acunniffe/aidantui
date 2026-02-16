export interface CalendarEvent {
  id: string;
  calendar_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_url: string | null;
  status: string;
  all_day: number;
  attendees: EventAttendee[];
}

export interface EventAttendee {
  id: number;
  event_id: string;
  contact_id: number | null;
  email: string;
  name: string | null;
  rsvp_status: string | null;
  organizer: number;
}
