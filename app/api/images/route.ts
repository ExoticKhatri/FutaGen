import { NextRequest, NextResponse } from 'next/server';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10; // Load 10 images at a time

  try {
    // Fetch from Cloudinary API
    const offset = (page - 1) * limit;
    const res = await fetch(
      `${request.nextUrl.origin}/api/cloudinary?max_results=${limit}&next_cursor=${offset}`,
      {
        headers: request.headers,
      }
    );
    const data: CloudinaryResponse = await res.json();
    return NextResponse.json({
      images: data.resources.map((img: CloudinaryResource) => img.secure_url),
      nextCursor: data.next_cursor,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Cloudinary' },
      { status: 500 }
    );
  }
}