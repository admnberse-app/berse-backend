import crypto from 'crypto';

/**
 * Interface for calendar event data
 */
export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date; // If not provided, defaults to 1 hour after start
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
}

/**
 * Generate iCalendar (.ics) file content
 * Compatible with Google Calendar, Apple Calendar, Outlook, etc.
 */
export function generateICalendar(event: CalendarEventData): string {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
  
  // Generate unique ID for the event
  const uid = crypto.randomUUID();
  
  // Format dates to iCalendar format (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // Clean and escape text for iCalendar format
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };
  
  // Wrap long lines at 75 characters (iCalendar specification)
  const wrapLine = (line: string): string => {
    const maxLength = 75;
    if (line.length <= maxLength) return line;
    
    const wrapped: string[] = [];
    let remaining = line;
    
    while (remaining.length > maxLength) {
      wrapped.push(remaining.substring(0, maxLength));
      remaining = ' ' + remaining.substring(maxLength); // Continuation lines start with space
    }
    wrapped.push(remaining);
    
    return wrapped.join('\r\n');
  };
  
  // Build iCalendar content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Berse App//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    wrapLine(`SUMMARY:${escapeText(event.title)}`),
    wrapLine(`DESCRIPTION:${escapeText(event.description)}`),
    wrapLine(`LOCATION:${escapeText(event.location)}`),
  ];
  
  // Add URL if provided
  if (event.url) {
    lines.push(wrapLine(`URL:${event.url}`));
  }
  
  // Add organizer if provided
  if (event.organizer) {
    lines.push(
      wrapLine(`ORGANIZER;CN=${escapeText(event.organizer.name)}:MAILTO:${event.organizer.email}`)
    );
  }
  
  // Add alarm/reminder (15 minutes before)
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    wrapLine(`DESCRIPTION:Reminder: ${escapeText(event.title)}`),
    'END:VALARM'
  );
  
  // Close VEVENT and VCALENDAR
  lines.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );
  
  return lines.join('\r\n');
}

/**
 * Generate Google Calendar link (alternative/additional option)
 */
export function generateGoogleCalendarLink(event: CalendarEventData): string {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description + (event.url ? `\n\nEvent Link: ${event.url}` : ''),
    location: event.location,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar link (webcal protocol)
 */
export function generateAppleCalendarLink(icsContent: string): string {
  // In practice, you'd need to host the .ics file and return a webcal:// URL
  // For now, this returns the data URL which works in some contexts
  const base64 = Buffer.from(icsContent).toString('base64');
  return `data:text/calendar;base64,${base64}`;
}

/**
 * Generate Outlook calendar link
 */
export function generateOutlookCalendarLink(event: CalendarEventData): string {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description + (event.url ? `\n\nEvent Link: ${event.url}` : ''),
    location: event.location,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
