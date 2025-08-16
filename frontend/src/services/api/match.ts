// Mock Match API Service
export const matchAPI = {
  // Get user connections
  getConnections: async (mode: string, page: number = 1) => {
    // Mock API response
    return {
      data: [
        {
          id: '1',
          name: 'Ahmad Rahman',
          location: 'Kuala Lumpur',
          match: 85,
          tags: ['Student', 'Tech', 'Travel'],
          bio: 'Computer Science student looking for travel buddies'
        },
        {
          id: '2',
          name: 'Siti Nurhaliza',
          location: 'Selangor',
          match: 78,
          tags: ['Mentor', 'Business', 'Finance'],
          bio: 'Business mentor helping young entrepreneurs'
        }
      ],
      hasMore: false,
      total: 2
    };
  },

  // Create introduction
  createIntroduction: async (data: any) => {
    console.log('Creating introduction:', data);
    return { success: true, id: Date.now().toString() };
  },

  // Get user achievements
  getAchievements: async () => {
    return [
      { id: '1', name: 'First Connection', earned: true },
      { id: '2', name: 'Network Builder', earned: false }
    ];
  },

  // Create squad
  createSquad: async (data: any) => {
    console.log('Creating squad:', data);
    return { success: true, id: Date.now().toString() };
  }
};