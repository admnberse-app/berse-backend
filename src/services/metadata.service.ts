import { GuideType, AccommodationType, PaymentType } from '@prisma/client';
import { ServiceMetadata } from '../types/services.types';

export class MetadataService {
  /**
   * Get all service-related metadata for frontend
   */
  static getServiceMetadata(): ServiceMetadata {
    return {
      guideTypes: this.getGuideTypes(),
      accommodationTypes: this.getAccommodationTypes(),
      paymentTypes: this.getPaymentTypes(),
      commonLanguages: this.getCommonLanguages(),
      commonAmenities: this.getCommonAmenities(),
      popularCities: this.getPopularCities(),
    };
  }

  /**
   * Get guide type enum with labels and descriptions
   */
  static getGuideTypes() {
    return [
      {
        value: GuideType.FOOD_TOUR,
        label: 'Food Tour',
        description: 'Restaurant hopping, street food, markets',
      },
      {
        value: GuideType.CULTURAL_TOUR,
        label: 'Cultural Tour',
        description: 'Museums, temples, historical sites',
      },
      {
        value: GuideType.NIGHTLIFE,
        label: 'Nightlife',
        description: 'Bars, clubs, entertainment',
      },
      {
        value: GuideType.HIKING,
        label: 'Hiking',
        description: 'Nature walks, mountain trails',
      },
      {
        value: GuideType.CYCLING,
        label: 'Cycling',
        description: 'Bike tours around city',
      },
      {
        value: GuideType.PHOTOGRAPHY,
        label: 'Photography',
        description: 'Photo spots, photography tips',
      },
      {
        value: GuideType.SHOPPING,
        label: 'Shopping',
        description: 'Best stores, markets, malls',
      },
      {
        value: GuideType.LOCAL_EXPERIENCE,
        label: 'Local Experience',
        description: 'Live like a local',
      },
      {
        value: GuideType.HISTORICAL_SITES,
        label: 'Historical Sites',
        description: 'History-focused tours',
      },
      {
        value: GuideType.NATURE_WALKS,
        label: 'Nature Walks',
        description: 'Parks, gardens, nature',
      },
      {
        value: GuideType.BAR_HOPPING,
        label: 'Bar Hopping',
        description: 'Bar crawl',
      },
      {
        value: GuideType.COFFEE_CRAWL,
        label: 'Coffee Crawl',
        description: 'Best coffee shops',
      },
      {
        value: GuideType.STREET_ART,
        label: 'Street Art',
        description: 'Graffiti, murals, art scene',
      },
      {
        value: GuideType.HIDDEN_GEMS,
        label: 'Hidden Gems',
        description: 'Off-the-beaten-path spots',
      },
      {
        value: GuideType.FAMILY_FRIENDLY,
        label: 'Family Friendly',
        description: 'Suitable for families with kids',
      },
      {
        value: GuideType.ADVENTURE_SPORTS,
        label: 'Adventure Sports',
        description: 'Extreme activities',
      },
    ];
  }

  /**
   * Get accommodation type enum with labels and descriptions
   */
  static getAccommodationTypes() {
    return [
      {
        value: AccommodationType.PRIVATE_ROOM,
        label: 'Private Room',
        description: 'Guest gets a private bedroom',
      },
      {
        value: AccommodationType.SHARED_ROOM,
        label: 'Shared Room',
        description: 'Guest shares a room with others',
      },
      {
        value: AccommodationType.COUCH,
        label: 'Couch',
        description: 'Couch/sofa in common area',
      },
      {
        value: AccommodationType.ENTIRE_PLACE,
        label: 'Entire Place',
        description: 'Guest has entire apartment/house',
      },
    ];
  }

  /**
   * Get payment type enum with labels and descriptions
   */
  static getPaymentTypes() {
    return [
      {
        value: PaymentType.MONEY,
        label: 'Money',
        description: 'Cash or digital payment',
      },
      {
        value: PaymentType.SKILL_TRADE,
        label: 'Skill Trade',
        description: 'Exchange skills (teach language, cook, etc.)',
      },
      {
        value: PaymentType.TREAT_ME,
        label: 'Treat Me',
        description: 'Buy me food/drinks (lunch, dinner, groceries, coffee, etc.)',
      },
      {
        value: PaymentType.BERSE_POINTS,
        label: 'Berse Points',
        description: 'Pay with platform points',
      },
      {
        value: PaymentType.FREE,
        label: 'Free',
        description: 'Free, no payment required',
      },
      {
        value: PaymentType.NEGOTIABLE,
        label: 'Negotiable',
        description: 'To be discussed',
      },
    ];
  }

  /**
   * Get list of common languages
   */
  static getCommonLanguages(): string[] {
    return [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Portuguese',
      'Russian',
      'Chinese (Mandarin)',
      'Japanese',
      'Korean',
      'Arabic',
      'Hindi',
      'Bengali',
      'Turkish',
      'Dutch',
      'Swedish',
      'Polish',
      'Greek',
      'Hebrew',
      'Thai',
      'Vietnamese',
      'Indonesian',
      'Tagalog',
      'Swahili',
    ].sort();
  }

  /**
   * Get list of common amenities for HomeSurf
   */
  static getCommonAmenities(): string[] {
    return [
      // Essentials
      'wifi',
      'heating',
      'air_conditioning',
      'hot_water',
      
      // Kitchen
      'kitchen',
      'refrigerator',
      'microwave',
      'coffee_maker',
      'dishes_utensils',
      
      // Bathroom
      'shower',
      'bathtub',
      'towels',
      'toiletries',
      'hair_dryer',
      
      // Sleeping
      'bed_linens',
      'extra_pillows',
      'hangers',
      'iron',
      
      // Entertainment
      'tv',
      'streaming_services',
      'books',
      'board_games',
      
      // Work
      'workspace',
      'desk',
      'office_chair',
      'monitor',
      
      // Laundry
      'washing_machine',
      'dryer',
      'laundry_detergent',
      
      // Outdoor
      'balcony',
      'garden',
      'patio',
      'bbq_grill',
      
      // Parking & Transport
      'parking',
      'garage',
      'bike_storage',
      'ev_charging',
      
      // Safety & Security
      'smoke_alarm',
      'carbon_monoxide_alarm',
      'fire_extinguisher',
      'first_aid_kit',
      'lock_on_bedroom',
      'safe',
      
      // Pet-Friendly
      'pets_allowed',
      'cat_friendly',
      'dog_friendly',
      
      // Accessibility
      'wheelchair_accessible',
      'elevator',
      'step_free_access',
      
      // Extras
      'gym',
      'pool',
      'hot_tub',
      'sauna',
    ].sort();
  }

  /**
   * Get list of popular cities (can be extended or fetched from DB)
   */
  static getPopularCities(): string[] {
    return [
      // Asia
      'Tokyo',
      'Bangkok',
      'Singapore',
      'Seoul',
      'Hong Kong',
      'Taipei',
      'Mumbai',
      'Delhi',
      'Jakarta',
      'Manila',
      'Dubai',
      'Istanbul',
      
      // Europe
      'London',
      'Paris',
      'Berlin',
      'Amsterdam',
      'Barcelona',
      'Madrid',
      'Rome',
      'Prague',
      'Vienna',
      'Lisbon',
      'Copenhagen',
      'Stockholm',
      'Athens',
      'Budapest',
      
      // North America
      'New York',
      'Los Angeles',
      'San Francisco',
      'Chicago',
      'Toronto',
      'Vancouver',
      'Mexico City',
      'Montreal',
      'Seattle',
      'Boston',
      'Miami',
      'Austin',
      
      // South America
      'São Paulo',
      'Rio de Janeiro',
      'Buenos Aires',
      'Lima',
      'Santiago',
      'Bogotá',
      
      // Oceania
      'Sydney',
      'Melbourne',
      'Auckland',
      'Brisbane',
      
      // Africa
      'Cape Town',
      'Johannesburg',
      'Nairobi',
      'Cairo',
      'Marrakech',
    ].sort();
  }

  /**
   * Get trust level descriptions
   */
  static getTrustLevels() {
    return [
      {
        value: 'starter',
        label: 'Starter',
        description: 'New member, building trust',
        minScore: 0,
        maxScore: 29,
      },
      {
        value: 'established',
        label: 'Established',
        description: 'Active member with some trust',
        minScore: 30,
        maxScore: 59,
      },
      {
        value: 'trusted',
        label: 'Trusted',
        description: 'Highly trusted member',
        minScore: 60,
        maxScore: 79,
      },
      {
        value: 'verified',
        label: 'Verified',
        description: 'Verified and exceptional member',
        minScore: 80,
        maxScore: 100,
      },
    ];
  }

  /**
   * Get activity level descriptions
   */
  static getActivityLevels() {
    return [
      {
        value: 'very_active',
        label: 'Very Active',
        description: 'Responds within hours, very engaged',
      },
      {
        value: 'active',
        label: 'Active',
        description: 'Responds within a day, regularly active',
      },
      {
        value: 'occasional',
        label: 'Occasional',
        description: 'Responds within a few days',
      },
      {
        value: 'inactive',
        label: 'Inactive',
        description: 'Rarely active or responds slowly',
      },
    ];
  }
}
