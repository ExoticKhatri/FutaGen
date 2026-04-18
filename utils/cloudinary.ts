// @/utils/cloudinary.ts

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryResponse {
  resources: CloudinaryImage[];
  next_cursor?: string;
}

/**
 * Fetch images from Cloudinary
 * @param tag Optional tag to filter images
 * @param cursor Optional pagination cursor
 * @param maxResults Number of images to fetch (default 10)
 */
export async function getCloudinaryImages(
  tag?: string,
  cursor?: string,
  maxResults: number = 10
): Promise<{ images: string[]; nextCursor?: string }> {
  try {
    const query = new URLSearchParams({
      max_results: maxResults.toString(),
      ...(cursor && { next_cursor: cursor }),
      ...(tag && { tags: tag }),
    });

    const response = await fetch(`/api/cloudinary?${query.toString()}`);
    const data: CloudinaryResponse = await response.json();

    return {
      images: data.resources.map((img) => img.secure_url),
      nextCursor: data.next_cursor,
    };
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
    throw error;
  }
}
