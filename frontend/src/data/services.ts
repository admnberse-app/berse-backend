// Shared service configuration for consistent display across the app

export interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export const serviceConfigs: ServiceConfig[] = [
  {
    id: 'localGuide',
    name: 'Local Guide',
    icon: '🗺️',
    color: '#28a745',
    description: 'I can show you around my city'
  },
  {
    id: 'homestay',
    name: 'Homestay',
    icon: '🏠',
    color: '#ffc107',
    description: 'I can host travelers'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: '🛍️',
    color: '#dc3545',
    description: 'I offer products or services'
  },
  {
    id: 'openToConnect',
    name: 'Open to Connect',
    icon: '🤝',
    color: '#6f42c1',
    description: 'Available for networking'
  },
  {
    id: 'bersebuddy',
    name: 'BerseBuddy',
    icon: '👥',
    color: '#17a2b8',
    description: 'Looking for activity partners'
  },
  {
    id: 'bersementor',
    name: 'BerseMentor',
    icon: '👨‍🏫',
    color: '#2E7D32',
    description: 'I can mentor in my field'
  }
];

// Helper function to get service config by id
export const getServiceConfig = (serviceId: string): ServiceConfig | undefined => {
  return serviceConfigs.find(service => service.id === serviceId);
};

// Helper function to convert boolean services object to array of service configs
export const getServicesFromObject = (servicesOffered?: {
  localGuide?: boolean;
  homestay?: boolean;
  marketplace?: boolean;
  openToConnect?: boolean;
  bersebuddy?: boolean;
  bersementor?: boolean;
}): ServiceConfig[] => {
  if (!servicesOffered) return [];
  
  const activeServices: ServiceConfig[] = [];
  
  Object.entries(servicesOffered).forEach(([key, value]) => {
    if (value) {
      const config = getServiceConfig(key);
      if (config) {
        activeServices.push(config);
      }
    }
  });
  
  return activeServices;
};

// Helper function to convert service array to boolean object
export const getServicesObject = (services: ServiceConfig[]): {
  localGuide?: boolean;
  homestay?: boolean;
  marketplace?: boolean;
  openToConnect?: boolean;
  bersebuddy?: boolean;
  bersementor?: boolean;
} => {
  const servicesObject: any = {};
  
  services.forEach(service => {
    servicesObject[service.id] = true;
  });
  
  return servicesObject;
};