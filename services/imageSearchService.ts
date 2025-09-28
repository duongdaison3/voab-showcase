export interface SearchResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
}

// Pexels API response structure for a photo
interface PexelsPhoto {
  id: number;
  src: {
    large: string;
    medium: string;
  };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

/**
 * Generates mock image search results as a fallback.
 * This uses picsum.photos to generate placeholder images.
 */
const getMockImages = async (query: string): Promise<SearchResult[]> => {
    console.warn(`API_KEY not found or Pexels API failed. Falling back to mock image search for: ${query}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
  
    // Generate 12 mock results.
    return Array.from({ length: 12 }).map((_, i) => {
      const id = `${query.replace(/\s/g, '_')}_${i}`;
      return {
        id: id,
        url: `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/200/150`,
        description: `A mock image for '${query}' #${i + 1}`,
      };
    });
}

/**
 * Searches for images using the Pexels API.
 * Falls back to a mock service if the API key is not provided or if the API call fails.
 */
export const searchImages = async (query: string): Promise<SearchResult[]> => {
  if (!process.env.API_KEY) {
    return getMockImages(query);
  }

  try {
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=12`, {
      headers: {
        Authorization: process.env.API_KEY,
      },
    });

    if (!response.ok) {
      console.error("Pexels API error:", response.status, response.statusText);
      // Fallback to mock on API error (e.g., invalid key)
      return getMockImages(query);
    }

    const data: PexelsResponse = await response.json();

    if (data.photos.length === 0) {
        return [];
    }

    return data.photos.map((photo: PexelsPhoto) => ({
      id: photo.id.toString(),
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      description: photo.alt,
    }));
  } catch (error) {
    console.error("Failed to fetch from Pexels API:", error);
    // Fallback to mock on network error
    return getMockImages(query);
  }
};
