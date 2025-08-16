// BerseMukha Monthly Events Data (January 2023 - July 2025)

export interface BerseMukhaEvent {
  id: string;
  month: string;
  year: number;
  theme: string;
  location: string;
  venue: string;
  attendees: number;
  host: string;
  description: string;
  activities: string[];
}

export interface PersonEventAttendance {
  eventId: string;
  attended: boolean;
  friendsMade: {
    name: string;
    profession: string;
    connected: boolean;
  }[];
}

// Generate all BerseMukha events from Jan 2023 to July 2025
export const generateBerseMukhaEvents = (): BerseMukhaEvent[] => {
  const events: BerseMukhaEvent[] = [];
  const themes = [
    'Coffee & Conversations',
    'Tech & Innovation',
    'Arts & Culture',
    'Food & Heritage',
    'Sports & Wellness',
    'Business Networking',
    'Photography Walk',
    'Book Club',
    'Language Exchange',
    'Startup Pitch',
    'Traditional Crafts',
    'Music Jam'
  ];
  
  const locations = [
    { city: 'Kuala Lumpur', venues: ['NAMA Space', 'APW Bangsar', 'REXKL', 'Zhongshan Building'] },
    { city: 'Penang', venues: ['The Habitat', 'China House', 'Hin Bus Depot', 'George Town'] },
    { city: 'Johor Bahru', venues: ['Kilang Bateri', 'KOMTAR JBCC', 'Johor Art Gallery'] },
    { city: 'Cyberjaya', venues: ['Tamarind Square', 'D\'Pulze', 'Shaftsbury Square'] },
    { city: 'Petaling Jaya', venues: ['Jaya One', 'The School', 'Central Park'] }
  ];
  
  const hosts = ['NAMA Foundation', 'Ahmad Rahman', 'Sarah Lim', 'Community Leaders', 'Lisa Wong', 'Raj Kumar'];
  
  let eventId = 1;
  
  // Generate events for each month
  for (let year = 2023; year <= 2025; year++) {
    const endMonth = (year === 2025) ? 7 : 12; // July for 2025, December for other years
    const startMonth = (year === 2023) ? 1 : 1; // Start from January
    
    for (let month = startMonth; month <= endMonth; month++) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const theme = themes[(eventId - 1) % themes.length];
      const locationData = locations[(eventId - 1) % locations.length];
      const venue = locationData.venues[Math.floor(Math.random() * locationData.venues.length)];
      const host = hosts[(eventId - 1) % hosts.length];
      
      events.push({
        id: `BM-${year}-${month.toString().padStart(2, '0')}`,
        month: monthNames[month - 1],
        year: year,
        theme: theme,
        location: locationData.city,
        venue: venue,
        attendees: 20 + Math.floor(Math.random() * 80), // 20-100 attendees
        host: host,
        description: `Monthly BerseMukha gathering focused on ${theme.toLowerCase()}`,
        activities: [
          'Ice Breaking Session',
          'Theme Discussion',
          'Networking Time',
          'Group Activities',
          'Photo Session'
        ]
      });
      
      eventId++;
    }
  }
  
  return events;
};

// Sample attendance data for a person
export const generatePersonAttendance = (personName: string): PersonEventAttendance[] => {
  const events = generateBerseMukhaEvents();
  const attendance: PersonEventAttendance[] = [];
  
  // Sample friends pool
  const friendsPool = [
    { name: 'Ahmad Rahman', profession: 'Software Engineer' },
    { name: 'Sarah Lim', profession: 'Photographer' },
    { name: 'Lisa Wong', profession: 'Marketing Manager' },
    { name: 'Raj Kumar', profession: 'Business Analyst' },
    { name: 'Fatima Hassan', profession: 'Doctor' },
    { name: 'John Tan', profession: 'Architect' },
    { name: 'Maya Siti', profession: 'Teacher' },
    { name: 'Ali Muhammad', profession: 'Entrepreneur' },
    { name: 'Jessica Lee', profession: 'Designer' },
    { name: 'Kumar Raju', profession: 'Consultant' },
    { name: 'Nurul Ain', profession: 'Lawyer' },
    { name: 'David Chen', profession: 'Chef' },
    { name: 'Zara Ibrahim', profession: 'Artist' },
    { name: 'Omar Khalid', profession: 'Engineer' },
    { name: 'Emma Ng', profession: 'Product Manager' }
  ];
  
  // Randomly select which events this person attended (about 30-40% attendance)
  events.forEach(event => {
    const attended = Math.random() < 0.35; // 35% chance of attendance
    
    if (attended) {
      // Random number of friends made (1-5)
      const numFriends = 1 + Math.floor(Math.random() * 5);
      const friendsMade = [];
      
      // Randomly select friends
      const shuffled = [...friendsPool].sort(() => 0.5 - Math.random());
      for (let i = 0; i < numFriends; i++) {
        friendsMade.push({
          ...shuffled[i],
          connected: Math.random() < 0.3 // 30% already connected
        });
      }
      
      attendance.push({
        eventId: event.id,
        attended: true,
        friendsMade: friendsMade
      });
    }
  });
  
  return attendance;
};

export const berseMukhaEvents = generateBerseMukhaEvents();