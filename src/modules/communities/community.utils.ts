import ProfileMetadataService from '../metadata/profile-metadata.service';

/**
 * Get list of valid interest values from profile metadata
 */
export async function getValidInterests(): Promise<string[]> {
  const interestsData = await ProfileMetadataService.getInterests();
  return interestsData.items.map((item: any) => item.value);
}

/**
 * Validate if provided interests are valid
 */
export async function validateInterests(interests: string[]): Promise<{
  isValid: boolean;
  invalidInterests: string[];
}> {
  const validInterests = await getValidInterests();
  const invalidInterests = interests.filter(
    (interest) => !validInterests.includes(interest)
  );

  return {
    isValid: invalidInterests.length === 0,
    invalidInterests,
  };
}

/**
 * Get interest categories from profile metadata (for display/grouping)
 */
export async function getInterestCategories(): Promise<string[]> {
  const interestsData = await ProfileMetadataService.getInterests();
  const categories = new Set(interestsData.items.map((item: any) => item.category));
  return Array.from(categories);
}
