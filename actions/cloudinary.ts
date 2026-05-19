"use server";

import { v2 as cloudinary } from 'cloudinary';

const FOLDER = 'futa-gen';

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

const sanitize = (s: string) => s.replace(/[|=]/g, ' ').slice(0, 300);

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadToCloudinary(params: {
  imageDataUrl: string;
  prompt:       string | null;
  seed:         string;
  source?:      string;
  tags?:        string[];
  ratio?:       string;
  composition?: string;
  style?:       string;
  traitTitles?: string; // pre-serialised "category:title, ..." string
}) {
  configure();

  const { imageDataUrl, prompt, seed, source, tags, ratio, composition, style, traitTitles } = params;

  const context: Record<string, string> = {
    seed:        sanitize(seed),
    prompt:      sanitize(prompt ?? ''),
    ratio:       sanitize(ratio        ?? ''),
    composition: sanitize(composition  ?? ''),
    style:       sanitize(style        ?? ''),
    traits:      sanitize(traitTitles  ?? ''),
    ...(source ? { source: sanitize(source) } : {}),
  };

  try {
    const result = await cloudinary.uploader.upload(imageDataUrl, {
      folder:        FOLDER,
      context,
      tags:          tags ?? [],
      resource_type: 'image',
    });

    return {
      success:   true,
      publicId:  result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (err: any) {
    console.error('CLOUDINARY_UPLOAD_ERROR:', err?.message ?? err);
    return { success: false, error: err?.message ?? 'Upload failed' };
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return { success: true };
  } catch (err: any) {
    console.error('CLOUDINARY_DELETE_ERROR:', err?.message ?? err);
    return { success: false, error: err?.message ?? 'Delete failed' };
  }
}

// ── Fetch library ─────────────────────────────────────────────────────────────

export interface LibraryImage {
  id:          string;
  url:         string;
  seed:        string;
  prompt:      string;
  ratio:       string;
  composition: string;
  style:       string;
  traits:      string;
  createdAt:   string;
}

export async function fetchLibraryImages(): Promise<{
  success: boolean;
  images:  LibraryImage[];
  error?:  string;
}> {
  configure();

  try {
    const result = await cloudinary.api.resources({
      type:        'upload',
      prefix:      `${FOLDER}/`,
      context:     true,
      max_results: 80,
    });

    const images: LibraryImage[] = (result.resources ?? []).map((r: any) => {
      const ctx = r.context?.custom ?? {};
      return {
        id:          r.public_id,
        url:         r.secure_url,
        seed:        ctx.seed        ?? '',
        prompt:      ctx.prompt      ?? '',
        ratio:       ctx.ratio       ?? '',
        composition: ctx.composition ?? '',
        style:       ctx.style       ?? '',
        traits:      ctx.traits      ?? '',
        createdAt:   r.created_at,
      };
    });

    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, images };
  } catch (err: any) {
    console.error('CLOUDINARY_FETCH_ERROR:', err?.message ?? err);
    return { success: false, images: [], error: err?.message ?? 'Fetch failed' };
  }
}
