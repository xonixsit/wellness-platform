import ical, { ICalCalendarMethod } from "ical-generator";

export interface CalendarEventOptions {
  summary: string;
  description: string;
  startAt: Date;
  endAt: Date;
  organizerName: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
  location?: string;
}

export function generateICS(opts: CalendarEventOptions): string {
  const cal = ical({ name: "Healio Session", method: ICalCalendarMethod.REQUEST });

  cal.createEvent({
    summary: opts.summary,
    description: opts.description,
    start: opts.startAt,
    end: opts.endAt,
    location: opts.location || "Online (link will be shared before session)",
    organizer: { name: opts.organizerName, email: opts.organizerEmail },
    attendees: [
      { name: opts.attendeeName, email: opts.attendeeEmail, rsvp: true },
      { name: opts.organizerName, email: opts.organizerEmail },
    ],
  });

  return cal.toString();
}
