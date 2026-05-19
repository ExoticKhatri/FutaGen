"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { TraitCategory, segmentToBase10 } from "@/types/traits";
import { revalidatePath } from "next/cache";

type UpdatePayload = {
  base36_map?: string;
  title?: string;
  description?: string;
  base10_map?: number;
};

export async function updateEntry(
  tableName: TraitCategory,
  id: string,
  updates: { base36_map?: string; title?: string; description?: string }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: UpdatePayload = { ...updates };
  
  if (updates.base36_map) {
    const base10_map = segmentToBase10(updates.base36_map);
    if (isNaN(base10_map)) {
      return { error: `Invalid base36_map: ${updates.base36_map}` };
    }
    payload.base10_map = base10_map;
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating entry ${id} in ${tableName}:`, error);
    return { error: error.message };
  }

  revalidatePath("/bbg");
  return { data, error: null };
}

export async function bulkUpdateEntries(
  tableName: TraitCategory,
  updates: Record<string, { base36_map?: string; title?: string; description?: string }>
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const promises = Object.entries(updates).map(async ([id, entryUpdates]) => {
    const payload: UpdatePayload = { ...entryUpdates };
    
    if (entryUpdates.base36_map) {
      const base10_map = segmentToBase10(entryUpdates.base36_map);
      if (!isNaN(base10_map)) {
        payload.base10_map = base10_map;
      }
    }

    return supabase.from(tableName).update(payload).eq("id", id);
  });

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error).map((r) => r.error);

  if (errors.length > 0) {
    console.error(`Error in bulk update for ${tableName}:`, errors);
    return { error: "Failed to update some entries" };
  }

  revalidatePath("/bbg");
  return { success: true, error: null };
}
