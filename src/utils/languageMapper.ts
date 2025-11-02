/**
 * Language Code to Label Mapper
 * Maps language codes (ISO 639-1) to user-friendly labels
 */

export interface LanguageItem {
  value: string;
  label: string;
  native: string;
  emoji: string;
}

// Language mapping based on profile metadata
const LANGUAGE_MAP: Record<string, LanguageItem> = {
  'en': { value: 'en', label: 'English', native: 'English', emoji: '🇬🇧' },
  'ms': { value: 'ms', label: 'Malay', native: 'Bahasa Melayu', emoji: '🇲🇾' },
  'zh': { value: 'zh', label: 'Chinese', native: '中文', emoji: '🇨🇳' },
  'ta': { value: 'ta', label: 'Tamil', native: 'தமிழ்', emoji: '🇮🇳' },
  'hi': { value: 'hi', label: 'Hindi', native: 'हिन्दी', emoji: '🇮🇳' },
  'bn': { value: 'bn', label: 'Bengali', native: 'বাংলা', emoji: '🇧🇩' },
  'id': { value: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', emoji: '🇮🇩' },
  'th': { value: 'th', label: 'Thai', native: 'ภาษาไทย', emoji: '🇹🇭' },
  'vi': { value: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', emoji: '🇻🇳' },
  'tl': { value: 'tl', label: 'Tagalog', native: 'Tagalog', emoji: '🇵🇭' },
  'ja': { value: 'ja', label: 'Japanese', native: '日本語', emoji: '🇯🇵' },
  'ko': { value: 'ko', label: 'Korean', native: '한국어', emoji: '🇰🇷' },
  'ar': { value: 'ar', label: 'Arabic', native: 'العربية', emoji: '🇸🇦' },
  'es': { value: 'es', label: 'Spanish', native: 'Español', emoji: '🇪🇸' },
  'fr': { value: 'fr', label: 'French', native: 'Français', emoji: '🇫🇷' },
  'de': { value: 'de', label: 'German', native: 'Deutsch', emoji: '🇩🇪' },
  'pt': { value: 'pt', label: 'Portuguese', native: 'Português', emoji: '🇵🇹' },
  'ru': { value: 'ru', label: 'Russian', native: 'Русский', emoji: '🇷🇺' },
  'it': { value: 'it', label: 'Italian', native: 'Italiano', emoji: '🇮🇹' },
  'nl': { value: 'nl', label: 'Dutch', native: 'Nederlands', emoji: '🇳🇱' },
  'pl': { value: 'pl', label: 'Polish', native: 'Polski', emoji: '🇵🇱' },
  'tr': { value: 'tr', label: 'Turkish', native: 'Türkçe', emoji: '🇹🇷' },
  'ur': { value: 'ur', label: 'Urdu', native: 'اردو', emoji: '🇵🇰' },
  'fa': { value: 'fa', label: 'Persian', native: 'فارسی', emoji: '🇮🇷' },
  'km': { value: 'km', label: 'Khmer', native: 'ភាសាខ្មែរ', emoji: '🇰🇭' },
  'my': { value: 'my', label: 'Burmese', native: 'မြန်မာဘာသာ', emoji: '🇲🇲' },
  'other': { value: 'other', label: 'Other', native: 'Other', emoji: '🌍' },
};

/**
 * Convert a single language code to user-friendly label
 * @param code - Language code (e.g., 'en', 'ms')
 * @returns User-friendly label (e.g., 'English', 'Malay')
 */
export function mapLanguageCodeToLabel(code: string): string {
  const language = LANGUAGE_MAP[code.toLowerCase()];
  return language ? language.label : code; // Fallback to code if not found
}

/**
 * Convert array of language codes to user-friendly labels
 * @param codes - Array of language codes
 * @returns Array of user-friendly labels
 */
export function mapLanguageCodesToLabels(codes: string[]): string[] {
  if (!codes || !Array.isArray(codes)) return [];
  return codes.map(code => mapLanguageCodeToLabel(code));
}

/**
 * Convert array of language codes to detailed objects with code and label
 * @param codes - Array of language codes
 * @returns Array of objects with code and label
 */
export function mapLanguageCodesToObjects(codes: string[]): Array<{ code: string; label: string; native: string; emoji: string }> {
  if (!codes || !Array.isArray(codes)) return [];
  return codes.map(code => {
    const language = LANGUAGE_MAP[code.toLowerCase()];
    if (language) {
      return {
        code: language.value,
        label: language.label,
        native: language.native,
        emoji: language.emoji,
      };
    }
    // Fallback for unknown codes
    return {
      code: code,
      label: code,
      native: code,
      emoji: '🌍',
    };
  });
}

/**
 * Get all available languages
 * @returns Array of all language items
 */
export function getAllLanguages(): LanguageItem[] {
  return Object.values(LANGUAGE_MAP);
}

/**
 * Check if a language code is valid
 * @param code - Language code to validate
 * @returns true if valid, false otherwise
 */
export function isValidLanguageCode(code: string): boolean {
  return code.toLowerCase() in LANGUAGE_MAP;
}
