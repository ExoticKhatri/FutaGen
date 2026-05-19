"use server";

import crypto from 'crypto';

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;
const FOLDER      = 'futa-gen';

function credentialsOk() {
  return CLOUD_NAME && API_KEY && API_SECRET;
}

// Escape Cloudinary context value special chars (| and =)
function escapeCtx(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/=/g, '\\=').replace(/\|/g, '\\|');
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadToCloudinary(params: {
  imageDataUrl: string;
  prompt: string;
  seed: string;
  source?: string;   // e.g. 'gemini' | 'gpt' — stored in context
  tags?: string[];   // e.g. ['external'] — Cloudinary tag list
}) {
  if (!credentialsOk()) {
    return { success: false, error: 'Cloudinary credentials not configured' };
  }

  const { imageDataUrl, prompt, seed, source, tags } = params;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Build context — source is optional extra field
  const ctxParts = [
    `prompt=${escapeCtx(prompt.slice(0, 500))}`,
    `seed=${escapeCtx(seed)}`,
    ...(source ? [`source=${escapeCtx(source)}`] : []),
  ];
  const contextStr = ctxParts.join('|');

  // Parameters that must be signed (sorted alphabetically)
  const toSign: Record<string, string> = {
    context:   contextStr,
    folder:    FOLDER,
    timestamp,
  };
  if (tags && tags.length > 0) toSign.tags = tags.join(',');

  const sigBase =
    Object.keys(toSign)
      .sort()
      .map(k => `${k}=${toSign[k]}`)
      .join('&') + API_SECRET;

  const signature = crypto.createHash('sha1').update(sigBase).digest('hex');

  const body = new FormData();
  body.append('file',      imageDataUrl);
  body.append('timestamp', timestamp);
  body.append('api_key',   API_KEY!);
  body.append('signature', signature);
  body.append('folder',    FOLDER);
  body.append('context',   contextStr);
  if (tags && tags.length > 0) body.append('tags', tags.join(','));

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message ?? 'Upload failed');

    return { success: true, publicId: data.public_id as string, secureUrl: data.secure_url as string };
  } catch (err: any) {
    return { success: false, error: err.message as string };
  }
}

// ── Fetch library ─────────────────────────────────────────────────────────────

export interface LibraryImage {
  id: string;
  url: string;
  seed: string;
  prompt: string;
  createdAt: string;
}

export async function fetchLibraryImages(): Promise<{ success: boolean; images: LibraryImage[]; error?: string }> {
  if (!credentialsOk()) {
    return { success: false, images: [], error: 'Cloudinary credentials not configured' };
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const qs   = new URLSearchParams({
    prefix:      `${FOLDER}/`,
    type:        'upload',
    context:     'true',
    max_results: '80',
  });

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?${qs}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache:   'no-store',
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message ?? 'Fetch failed');

    const images: LibraryImage[] = (data.resources ?? []).map((r: any) => ({
      id:        r.public_id,
      url:       r.secure_url,
      seed:      r.context?.custom?.seed    ?? '',
      prompt:    r.context?.custom?.prompt  ?? '',
      createdAt: r.created_at,
    }));

    // Newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, images };
  } catch (err: any) {
    return { success: false, images: [], error: err.message };
  }
}
