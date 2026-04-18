// @/app/api/cloudinary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryOptions {
  max_results: number;
  resource_type: string;
  type: string;
  fetch_max_items: number;
  next_cursor?: string;
  tags?: boolean;
}

interface CloudinaryApiResult {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('max_results') || '20');
    const nextCursor = searchParams.get('next_cursor') || undefined;
    const tags = searchParams.get('tags') || undefined;

    const options: CloudinaryOptions = {
      max_results: maxResults,
      resource_type: 'image',
      type: 'upload',
      fetch_max_items: maxResults,
    };

    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    if (tags) {
      options.tags = true;
    }

    const result: CloudinaryApiResult = await cloudinary.api.resources(
      options as Parameters<typeof cloudinary.api.resources>[0]
    );

    return NextResponse.json({
      resources: result.resources.map((resource: CloudinaryResource) => ({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
      })),
      next_cursor: result.next_cursor,
    });
  } catch (error) {
    console.error('Cloudinary API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch from Cloudinary', details: errorMessage },
      { status: 500 }
    );
  }
}