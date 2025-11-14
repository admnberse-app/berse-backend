/**
 * Profile Metadata Service
 * Provides curated lists for profile field options
 */
import { prisma } from '../../config/database';

class ProfileMetadataService {
  private readonly version = '1.0.0';
  private readonly lastUpdated = new Date().toISOString();

  /**
   * Get all profile metadata in one call
   */
  async getAllProfileMetadata() {
    return {
      version: this.version,
      lastUpdated: this.lastUpdated,
      interests: await this.getInterests(),
      languages: await this.getLanguages(),
      professions: await this.getProfessions(),
      genders: await this.getGenders(),
      travelStyles: await this.getTravelStyles(),
      personalityTypes: await this.getPersonalityTypes(),
      ageRanges: await this.getAgeRanges(),
      profileVisibilityOptions: await this.getProfileVisibilityOptions(),
      locationPrivacyOptions: await this.getLocationPrivacyOptions(),
    };
  }

  /**
   * Get interests/hobbies list
   */
  async getInterests() {
    return {
      category: 'Interests',
      description: 'User interests and hobbies',
      items: [
        // Sports & Fitness
        { value: 'fitness', label: 'Fitness', category: 'Sports & Fitness', emoji: '💪' },
        { value: 'yoga', label: 'Yoga', category: 'Sports & Fitness', emoji: '🧘' },
        { value: 'running', label: 'Running', category: 'Sports & Fitness', emoji: '🏃' },
        { value: 'cycling', label: 'Cycling', category: 'Sports & Fitness', emoji: '🚴' },
        { value: 'swimming', label: 'Swimming', category: 'Sports & Fitness', emoji: '🏊' },
        { value: 'hiking', label: 'Hiking', category: 'Sports & Fitness', emoji: '🥾' },
        { value: 'basketball', label: 'Basketball', category: 'Sports & Fitness', emoji: '🏀' },
        { value: 'football', label: 'Football', category: 'Sports & Fitness', emoji: '⚽' },
        { value: 'badminton', label: 'Badminton', category: 'Sports & Fitness', emoji: '🏸' },
        { value: 'martial_arts', label: 'Martial Arts', category: 'Sports & Fitness', emoji: '🥋' },
        
        // Arts & Culture
        { value: 'art', label: 'Art', category: 'Arts & Culture', emoji: '🎨' },
        { value: 'music', label: 'Music', category: 'Arts & Culture', emoji: '🎵' },
        { value: 'photography', label: 'Photography', category: 'Arts & Culture', emoji: '📸' },
        { value: 'design', label: 'Design', category: 'Arts & Culture', emoji: '✨' },
        { value: 'writing', label: 'Writing', category: 'Arts & Culture', emoji: '✍️' },
        { value: 'reading', label: 'Reading', category: 'Arts & Culture', emoji: '📚' },
        { value: 'cinema', label: 'Cinema', category: 'Arts & Culture', emoji: '🎬' },
        { value: 'theater', label: 'Theater', category: 'Arts & Culture', emoji: '🎭' },
        { value: 'dance', label: 'Dance', category: 'Arts & Culture', emoji: '💃' },
        { value: 'painting', label: 'Painting', category: 'Arts & Culture', emoji: '🖼️' },
        
        // Food & Drink
        { value: 'food', label: 'Food', category: 'Food & Drink', emoji: '🍽️' },
        { value: 'cooking', label: 'Cooking', category: 'Food & Drink', emoji: '👨‍🍳' },
        { value: 'baking', label: 'Baking', category: 'Food & Drink', emoji: '🧁' },
        { value: 'coffee', label: 'Coffee', category: 'Food & Drink', emoji: '☕' },
        { value: 'wine', label: 'Wine', category: 'Food & Drink', emoji: '🍷' },
        { value: 'mixology', label: 'Mixology', category: 'Food & Drink', emoji: '🍹' },
        
        // Technology
        { value: 'technology', label: 'Technology', category: 'Technology', emoji: '💻' },
        { value: 'coding', label: 'Coding', category: 'Technology', emoji: '👨‍💻' },
        { value: 'gaming', label: 'Gaming', category: 'Technology', emoji: '🎮' },
        { value: 'ai', label: 'AI', category: 'Technology', emoji: '🤖' },
        { value: 'blockchain', label: 'Blockchain', category: 'Technology', emoji: '⛓️' },
        { value: 'gadgets', label: 'Gadgets', category: 'Technology', emoji: '📱' },
        
        // Travel & Adventure
        { value: 'travel', label: 'Travel', category: 'Travel & Adventure', emoji: '✈️' },
        { value: 'adventure', label: 'Adventure', category: 'Travel & Adventure', emoji: '🏔️' },
        { value: 'camping', label: 'Camping', category: 'Travel & Adventure', emoji: '⛺' },
        { value: 'backpacking', label: 'Backpacking', category: 'Travel & Adventure', emoji: '🎒' },
        { value: 'road_trips', label: 'Road Trips', category: 'Travel & Adventure', emoji: '🚗' },
        
        // Social & Community
        { value: 'community', label: 'Community', category: 'Social & Community', emoji: '🤝' },
        { value: 'volunteering', label: 'Volunteering', category: 'Social & Community', emoji: '❤️' },
        { value: 'networking', label: 'Networking', category: 'Social & Community', emoji: '🌐' },
        { value: 'social_impact', label: 'Social Impact', category: 'Social & Community', emoji: '🌍' },
        { value: 'mentoring', label: 'Mentoring', category: 'Social & Community', emoji: '🎓' },
        
        // Business & Career
        { value: 'entrepreneurship', label: 'Entrepreneurship', category: 'Business & Career', emoji: '💼' },
        { value: 'business', label: 'Business', category: 'Business & Career', emoji: '📊' },
        { value: 'investing', label: 'Investing', category: 'Business & Career', emoji: '📈' },
        { value: 'startups', label: 'Startups', category: 'Business & Career', emoji: '🚀' },
        { value: 'marketing', label: 'Marketing', category: 'Business & Career', emoji: '📣' },
        
        // Wellness & Mindfulness
        { value: 'wellness', label: 'Wellness', category: 'Wellness & Mindfulness', emoji: '🌿' },
        { value: 'meditation', label: 'Meditation', category: 'Wellness & Mindfulness', emoji: '🧘‍♀️' },
        { value: 'mindfulness', label: 'Mindfulness', category: 'Wellness & Mindfulness', emoji: '☮️' },
        { value: 'nutrition', label: 'Nutrition', category: 'Wellness & Mindfulness', emoji: '🥗' },
        { value: 'health', label: 'Health', category: 'Wellness & Mindfulness', emoji: '🏥' },
        
        // Entertainment
        { value: 'anime', label: 'Anime', category: 'Entertainment', emoji: '🎌' },
        { value: 'esports', label: 'E-Sports', category: 'Entertainment', emoji: '🎯' },
        { value: 'streaming', label: 'Streaming', category: 'Entertainment', emoji: '📺' },
        { value: 'podcasts', label: 'Podcasts', category: 'Entertainment', emoji: '🎙️' },
        
        // Nature & Animals
        { value: 'nature', label: 'Nature', category: 'Nature & Animals', emoji: '🌳' },
        { value: 'pets', label: 'Pets', category: 'Nature & Animals', emoji: '🐾' },
        { value: 'gardening', label: 'Gardening', category: 'Nature & Animals', emoji: '🌱' },
        { value: 'wildlife', label: 'Wildlife', category: 'Nature & Animals', emoji: '🦁' },
        
        // Learning
        { value: 'education', label: 'Education', category: 'Learning', emoji: '📖' },
        { value: 'languages', label: 'Languages', category: 'Learning', emoji: '🗣️' },
        { value: 'science', label: 'Science', category: 'Learning', emoji: '🔬' },
        { value: 'history', label: 'History', category: 'Learning', emoji: '📜' },
        { value: 'philosophy', label: 'Philosophy', category: 'Learning', emoji: '🤔' },
        
        // Fashion & Style
        { value: 'fashion', label: 'Fashion', category: 'Fashion & Style', emoji: '👗' },
        { value: 'sustainability', label: 'Sustainability', category: 'Fashion & Style', emoji: '♻️' },
        
        // Religion & Spirituality
        { value: 'spirituality', label: 'Spirituality', category: 'Religion & Spirituality', emoji: '🕉️' },
        { value: 'religion', label: 'Religion', category: 'Religion & Spirituality', emoji: '🙏' },
      ],
    };
  }

  /**
   * Get languages list
   */
  async getLanguages() {
    return {
      category: 'Languages',
      description: 'Spoken languages',
      items: [
        { value: 'en', label: 'English', native: 'English', emoji: '🇬🇧' },
        { value: 'ms', label: 'Malay', native: 'Bahasa Melayu', emoji: '🇲🇾' },
        { value: 'zh', label: 'Chinese', native: '中文', emoji: '🇨🇳' },
        { value: 'ta', label: 'Tamil', native: 'தமிழ்', emoji: '🇮🇳' },
        { value: 'hi', label: 'Hindi', native: 'हिन्दी', emoji: '🇮🇳' },
        { value: 'bn', label: 'Bengali', native: 'বাংলা', emoji: '🇧🇩' },
        { value: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', emoji: '🇮🇩' },
        { value: 'th', label: 'Thai', native: 'ภาษาไทย', emoji: '🇹🇭' },
        { value: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', emoji: '🇻🇳' },
        { value: 'tl', label: 'Tagalog', native: 'Tagalog', emoji: '🇵🇭' },
        { value: 'ja', label: 'Japanese', native: '日本語', emoji: '🇯🇵' },
        { value: 'ko', label: 'Korean', native: '한국어', emoji: '🇰🇷' },
        { value: 'ar', label: 'Arabic', native: 'العربية', emoji: '🇸🇦' },
        { value: 'es', label: 'Spanish', native: 'Español', emoji: '🇪🇸' },
        { value: 'fr', label: 'French', native: 'Français', emoji: '🇫🇷' },
        { value: 'de', label: 'German', native: 'Deutsch', emoji: '🇩🇪' },
        { value: 'pt', label: 'Portuguese', native: 'Português', emoji: '🇵🇹' },
        { value: 'ru', label: 'Russian', native: 'Русский', emoji: '🇷🇺' },
        { value: 'it', label: 'Italian', native: 'Italiano', emoji: '🇮🇹' },
        { value: 'nl', label: 'Dutch', native: 'Nederlands', emoji: '🇳🇱' },
        { value: 'pl', label: 'Polish', native: 'Polski', emoji: '🇵🇱' },
        { value: 'tr', label: 'Turkish', native: 'Türkçe', emoji: '🇹🇷' },
        { value: 'ur', label: 'Urdu', native: 'اردو', emoji: '🇵🇰' },
        { value: 'fa', label: 'Persian', native: 'فارسی', emoji: '🇮🇷' },
        { value: 'km', label: 'Khmer', native: 'ភាសាខ្មែរ', emoji: '🇰🇭' },
        { value: 'my', label: 'Burmese', native: 'မြန်မာဘာသာ', emoji: '🇲🇲' },
        { value: 'other', label: 'Other', native: 'Other', emoji: '🌍' },
      ],
    };
  }

  /**
   * Get professions/occupations list
   */
  async getProfessions() {
    return {
      category: 'Professions',
      description: 'Professional roles and occupations',
      items: [
        // Technology
        { value: 'software_engineer', label: 'Software Engineer', category: 'Technology', emoji: '👨‍💻' },
        { value: 'data_scientist', label: 'Data Scientist', category: 'Technology', emoji: '📊' },
        { value: 'product_manager', label: 'Product Manager', category: 'Technology', emoji: '📱' },
        { value: 'ux_designer', label: 'UX Designer', category: 'Technology', emoji: '🎨' },
        { value: 'web_developer', label: 'Web Developer', category: 'Technology', emoji: '💻' },
        { value: 'it_consultant', label: 'IT Consultant', category: 'Technology', emoji: '🖥️' },
        
        // Business & Finance
        { value: 'entrepreneur', label: 'Entrepreneur', category: 'Business & Finance', emoji: '🚀' },
        { value: 'business_owner', label: 'Business Owner', category: 'Business & Finance', emoji: '💼' },
        { value: 'accountant', label: 'Accountant', category: 'Business & Finance', emoji: '🧮' },
        { value: 'financial_analyst', label: 'Financial Analyst', category: 'Business & Finance', emoji: '📈' },
        { value: 'banker', label: 'Banker', category: 'Business & Finance', emoji: '🏦' },
        { value: 'consultant', label: 'Consultant', category: 'Business & Finance', emoji: '💡' },
        
        // Creative & Media
        { value: 'graphic_designer', label: 'Graphic Designer', category: 'Creative & Media', emoji: '🎨' },
        { value: 'photographer', label: 'Photographer', category: 'Creative & Media', emoji: '📸' },
        { value: 'videographer', label: 'Videographer', category: 'Creative & Media', emoji: '🎥' },
        { value: 'content_creator', label: 'Content Creator', category: 'Creative & Media', emoji: '✍️' },
        { value: 'writer', label: 'Writer', category: 'Creative & Media', emoji: '📝' },
        { value: 'artist', label: 'Artist', category: 'Creative & Media', emoji: '🎭' },
        { value: 'musician', label: 'Musician', category: 'Creative & Media', emoji: '🎵' },
        
        // Education
        { value: 'teacher', label: 'Teacher', category: 'Education', emoji: '👨‍🏫' },
        { value: 'tutor', label: 'Tutor', category: 'Education', emoji: '📚' },
        { value: 'professor', label: 'Professor', category: 'Education', emoji: '🎓' },
        { value: 'trainer', label: 'Trainer', category: 'Education', emoji: '🏋️' },
        
        // Healthcare
        { value: 'doctor', label: 'Doctor', category: 'Healthcare', emoji: '👨‍⚕️' },
        { value: 'nurse', label: 'Nurse', category: 'Healthcare', emoji: '👩‍⚕️' },
        { value: 'therapist', label: 'Therapist', category: 'Healthcare', emoji: '🧘' },
        { value: 'pharmacist', label: 'Pharmacist', category: 'Healthcare', emoji: '💊' },
        { value: 'wellness_coach', label: 'Wellness Coach', category: 'Healthcare', emoji: '🌿' },
        
        // Hospitality & Tourism
        { value: 'chef', label: 'Chef', category: 'Hospitality & Tourism', emoji: '👨‍🍳' },
        { value: 'tour_guide', label: 'Tour Guide', category: 'Hospitality & Tourism', emoji: '🗺️' },
        { value: 'hotel_manager', label: 'Hotel Manager', category: 'Hospitality & Tourism', emoji: '🏨' },
        { value: 'event_organizer', label: 'Event Organizer', category: 'Hospitality & Tourism', emoji: '🎉' },
        
        // Sports & Fitness
        { value: 'personal_trainer', label: 'Personal Trainer', category: 'Sports & Fitness', emoji: '💪' },
        { value: 'yoga_instructor', label: 'Yoga Instructor', category: 'Sports & Fitness', emoji: '🧘‍♀️' },
        { value: 'athlete', label: 'Athlete', category: 'Sports & Fitness', emoji: '🏃' },
        { value: 'fitness_coach', label: 'Fitness Coach', category: 'Sports & Fitness', emoji: '🏋️' },
        
        // Marketing & Sales
        { value: 'marketing_manager', label: 'Marketing Manager', category: 'Marketing & Sales', emoji: '📣' },
        { value: 'sales_executive', label: 'Sales Executive', category: 'Marketing & Sales', emoji: '💼' },
        { value: 'social_media_manager', label: 'Social Media Manager', category: 'Marketing & Sales', emoji: '📱' },
        { value: 'digital_marketer', label: 'Digital Marketer', category: 'Marketing & Sales', emoji: '💻' },
        
        // Legal & Government
        { value: 'lawyer', label: 'Lawyer', category: 'Legal & Government', emoji: '⚖️' },
        { value: 'civil_servant', label: 'Civil Servant', category: 'Legal & Government', emoji: '🏛️' },
        
        // Other
        { value: 'student', label: 'Student', category: 'Other', emoji: '🎓' },
        { value: 'researcher', label: 'Researcher', category: 'Other', emoji: '🔬' },
        { value: 'freelancer', label: 'Freelancer', category: 'Other', emoji: '💼' },
        { value: 'community_organizer', label: 'Community Organizer', category: 'Other', emoji: '🤝' },
        { value: 'retired', label: 'Retired', category: 'Other', emoji: '🌴' },
        { value: 'homemaker', label: 'Homemaker', category: 'Other', emoji: '🏠' },
        { value: 'other', label: 'Other', category: 'Other', emoji: '👤' },
      ],
    };
  }

  /**
   * Get gender options
   */
  async getGenders() {
    return {
      category: 'Gender',
      description: 'Gender options',
      items: [
        { value: 'male', label: 'Male', emoji: '♂️' },
        { value: 'female', label: 'Female', emoji: '♀️' },
      ],
    };
  }

  /**
   * Get travel styles
   */
  async getTravelStyles() {
    return {
      category: 'Travel Styles',
      description: 'Travel preferences and styles',
      items: [
        { value: 'Backpacker', label: 'Backpacker', description: 'Budget-friendly, spontaneous adventure', emoji: '🎒' },
        { value: 'Luxury Traveler', label: 'Luxury Traveler', description: 'Comfort and premium experiences', emoji: '✨' },
        { value: 'Cultural Explorer', label: 'Cultural Explorer', description: 'Deep dive into local culture', emoji: '🏛️' },
        { value: 'Adventure Seeker', label: 'Adventure Seeker', description: 'Thrill and outdoor activities', emoji: '🏔️' },
        { value: 'Beach Lover', label: 'Beach Lover', description: 'Relaxation by the sea', emoji: '🏖️' },
        { value: 'Foodie Traveler', label: 'Foodie Traveler', description: 'Culinary experiences', emoji: '🍜' },
        { value: 'Solo Traveler', label: 'Solo Traveler', description: 'Independent exploration', emoji: '🚶' },
        { value: 'Family Traveler', label: 'Family Traveler', description: 'Family-friendly trips', emoji: '👨‍👩‍👧‍👦' },
        { value: 'Digital Nomad', label: 'Digital Nomad', description: 'Work while traveling', emoji: '💻' },
        { value: 'Eco-Tourist', label: 'Eco-Tourist', description: 'Sustainable and responsible travel', emoji: '🌿' },
        { value: 'City Explorer', label: 'City Explorer', description: 'Urban adventures', emoji: '🏙️' },
        { value: 'Nature Lover', label: 'Nature Lover', description: 'Wilderness and wildlife', emoji: '🌲' },
        { value: 'Budget Traveler', label: 'Budget Traveler', description: 'Cost-conscious trips', emoji: '💰' },
        { value: 'Weekend Warrior', label: 'Weekend Warrior', description: 'Short getaways', emoji: '⏰' },
      ],
    };
  }

  /**
   * Get personality types (MBTI)
   */
  async getPersonalityTypes() {
    return {
      category: 'Personality Types',
      description: 'MBTI personality types',
      items: [
        // Analysts
        { value: 'INTJ', label: 'INTJ - Architect', category: 'Analysts', description: 'Imaginative and strategic thinkers', emoji: '🏛️' },
        { value: 'INTP', label: 'INTP - Logician', category: 'Analysts', description: 'Innovative inventors', emoji: '🧪' },
        { value: 'ENTJ', label: 'ENTJ - Commander', category: 'Analysts', description: 'Bold, imaginative leaders', emoji: '👑' },
        { value: 'ENTP', label: 'ENTP - Debater', category: 'Analysts', description: 'Smart and curious thinkers', emoji: '🎯' },
        
        // Diplomats
        { value: 'INFJ', label: 'INFJ - Advocate', category: 'Diplomats', description: 'Quiet and mystical idealists', emoji: '🌟' },
        { value: 'INFP', label: 'INFP - Mediator', category: 'Diplomats', description: 'Poetic, kind, and altruistic', emoji: '🌈' },
        { value: 'ENFJ', label: 'ENFJ - Protagonist', category: 'Diplomats', description: 'Charismatic and inspiring leaders', emoji: '✨' },
        { value: 'ENFP', label: 'ENFP - Campaigner', category: 'Diplomats', description: 'Enthusiastic, creative, and sociable', emoji: '🎨' },
        
        // Sentinels
        { value: 'ISTJ', label: 'ISTJ - Logistician', category: 'Sentinels', description: 'Practical and fact-minded', emoji: '📋' },
        { value: 'ISFJ', label: 'ISFJ - Defender', category: 'Sentinels', description: 'Dedicated and warm protectors', emoji: '🛡️' },
        { value: 'ESTJ', label: 'ESTJ - Executive', category: 'Sentinels', description: 'Excellent administrators', emoji: '💼' },
        { value: 'ESFJ', label: 'ESFJ - Consul', category: 'Sentinels', description: 'Caring, social, and popular', emoji: '🤝' },
        
        // Explorers
        { value: 'ISTP', label: 'ISTP - Virtuoso', category: 'Explorers', description: 'Bold and practical experimenters', emoji: '🔧' },
        { value: 'ISFP', label: 'ISFP - Adventurer', category: 'Explorers', description: 'Flexible and charming artists', emoji: '🎭' },
        { value: 'ESTP', label: 'ESTP - Entrepreneur', category: 'Explorers', description: 'Smart, energetic, and perceptive', emoji: '🚀' },
        { value: 'ESFP', label: 'ESFP - Entertainer', category: 'Explorers', description: 'Spontaneous, energetic, and enthusiastic', emoji: '🎉' },
      ],
    };
  }

  /**
   * Get age ranges for profile filtering
   */
  async getAgeRanges() {
    return {
      category: 'Age Ranges',
      description: 'Age range options for profile filtering and matching',
      items: [
        { value: '18-24', label: '18-24 years', minAge: 18, maxAge: 24, emoji: '👶' },
        { value: '25-34', label: '25-34 years', minAge: 25, maxAge: 34, emoji: '👨‍💼' },
        { value: '35-44', label: '35-44 years', minAge: 35, maxAge: 44, emoji: '👩‍💼' },
        { value: '45-54', label: '45-54 years', minAge: 45, maxAge: 54, emoji: '👨‍🏫' },
        { value: '55-64', label: '55-64 years', minAge: 55, maxAge: 64, emoji: '👴' },
        { value: '65+', label: '65+ years', minAge: 65, maxAge: null, emoji: '👵' },
      ],
    };
  }

  /**
   * Get profile visibility options
   */
  async getProfileVisibilityOptions() {
    return {
      category: 'Profile Visibility',
      description: 'Privacy settings for profile visibility',
      items: [
        { value: 'public', label: 'Public', description: 'Anyone can see your profile', emoji: '🌍' },
        { value: 'friends', label: 'Friends Only', description: 'Only your connections can see your profile', emoji: '👥' },
        { value: 'private', label: 'Private', description: 'Only you can see your profile', emoji: '🔒' },
      ],
    };
  }

  /**
   * Get location privacy options
   */
  async getLocationPrivacyOptions() {
    return {
      category: 'Location Privacy',
      description: 'Privacy settings for location sharing',
      items: [
        { value: 'public', label: 'Public', description: 'Anyone can see your location', emoji: '📍' },
        { value: 'friends', label: 'Friends Only', description: 'Only your connections can see your location', emoji: '👥' },
        { value: 'private', label: 'Private', description: 'Your location is hidden', emoji: '🚫' },
      ],
    };
  }

  /**
   * Validate username availability
   */
  async validateUsername(username: string) {
    // Basic validation rules
    const errors = [];

    // Check length
    if (!username || username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
      errors.push('Username must be no more than 30 characters long');
    }

    // Check format (alphanumeric, underscore, dash only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and dashes');
    }

    // Check for reserved words
    const reservedWords = ['admin', 'root', 'system', 'api', 'www', 'app', 'berse', 'null', 'undefined'];
    if (reservedWords.includes(username.toLowerCase())) {
      errors.push('This username is reserved and cannot be used');
    }

    // If basic validation fails, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        isAvailable: false,
        errors,
        suggestions: this.generateUsernameSuggestions(username),
        message: 'Please fix the issues below and try again',
        userFriendlyMessage: errors.join('. ') + '.'
      };
    }

    // Check database availability
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: username.trim() },
        select: { id: true }
      });

      const isAvailable = !existingUser;

      return {
        isValid: true,
        isAvailable,
        errors: [],
        suggestions: isAvailable ? [] : this.generateUsernameSuggestions(username),
        message: isAvailable ? 'Great! This username is available' : 'This username is already taken',
        userFriendlyMessage: isAvailable 
          ? `"${username}" is available and ready to use!` 
          : `"${username}" is already taken. Try one of these suggestions instead.`
      };
    } catch (error) {
      console.error('Error checking username availability:', error);
      return {
        isValid: false,
        isAvailable: false,
        errors: ['Unable to validate username at this time. Please try again.'],
        suggestions: this.generateUsernameSuggestions(username),
        message: 'Validation temporarily unavailable',
        userFriendlyMessage: 'Unable to check username availability right now. Please try again in a moment.'
      };
    }
  }

  /**
   * Generate username suggestions
   */
  private generateUsernameSuggestions(baseUsername: string): string[] {
    const reservedWords = ['admin', 'root', 'system', 'api', 'www', 'app', 'berse', 'null', 'undefined'];
    const suggestions = [];
    
    // Clean the base username for suggestions
    let cleanBase = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') // Remove invalid characters
      .replace(/^[_-]+|[_-]+$/g, '') // Remove leading/trailing underscores/dashes
      .substring(0, 20); // Limit length for suggestions
    
    // If cleaned base is reserved or too short, use a generic base
    if (cleanBase.length < 3 || reservedWords.includes(cleanBase)) {
      cleanBase = 'user';
    }
    
    const numbers = ['123', '2024', '99', '007'];
    const suffixes = ['_official', '_traveler', '_explorer', '_wanderer'];

    // Add numbers
    numbers.forEach(num => {
      const suggestion = `${cleanBase}${num}`;
      if (suggestion.length <= 30 && !reservedWords.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    });

    // Add suffixes
    suffixes.forEach(suffix => {
      const suggestion = `${cleanBase}${suffix}`;
      if (suggestion.length <= 30 && !reservedWords.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    });

    // Random combinations
    const randomNum = Math.floor(Math.random() * 1000);
    const randomSuggestion = `${cleanBase}_${randomNum}`;
    if (randomSuggestion.length <= 30 && !reservedWords.includes(randomSuggestion)) {
      suggestions.push(randomSuggestion);
    }
    
    const randomNum2 = Math.floor(Math.random() * 100);
    const randomSuggestion2 = `${cleanBase}${randomNum2}`;
    if (randomSuggestion2.length <= 30 && !reservedWords.includes(randomSuggestion2)) {
      suggestions.push(randomSuggestion2);
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }
}

export default new ProfileMetadataService();
