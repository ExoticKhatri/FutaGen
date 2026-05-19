"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { TraitCategory } from "@/types/traits";
import { revalidatePath } from "next/cache";

export async function deleteEntry(tableName: TraitCategory, id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get the last entry in the table
  const { data: lastEntry } = await supabase
    .from(tableName)
    .select("*")
    .order("base10_map", { ascending: false })
    .limit(1)
    .single();

  if (!lastEntry) return { error: "Table is empty" };

  if (lastEntry.id === id) {
    // If the entry to delete is already the last entry, just delete it
    const { error } = await supabase.from(tableName).delete().eq("id", id);
    if (error) return { error: error.message };
  } else {
    // 2. Delete the last entry
    const { error: deleteError } = await supabase.from(tableName).delete().eq("id", lastEntry.id);
    if (deleteError) return { error: deleteError.message };

    // 3. Update the target entry with the last entry's data (swapping)
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        title: lastEntry.title,
        description: lastEntry.description,
      })
      .eq("id", id);
      
    if (updateError) return { error: updateError.message };
  }

  revalidatePath("/bbg");
  return { success: true, error: null };
}

export async function bulkDeleteEntries(tableName: TraitCategory, ids: string[]) {
  if (!ids.length) return { success: true, error: null };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get the targets with their base10_map so we can sort them descending
  // This ensures we always process deletions from the end of the table backwards,
  // preventing us from accidentally swapping a target with another target.
  const { data: targets, error: fetchError } = await supabase
    .from(tableName)
    .select("id, base10_map")
    .in("id", ids)
    .order("base10_map", { ascending: false });

  if (fetchError) return { error: fetchError.message };
  if (!targets || targets.length === 0) return { error: "Entries not found" };

  // 2. Process deletions from highest base10_map to lowest
  for (const target of targets) {
    // get current last entry
    const { data: lastEntry } = await supabase
      .from(tableName)
      .select("*")
      .order("base10_map", { ascending: false })
      .limit(1)
      .single();

    if (!lastEntry) break;

    if (lastEntry.id === target.id) {
      // Just delete it
      await supabase.from(tableName).delete().eq("id", target.id);
    } else {
      // Delete last entry
      const { error: deleteError } = await supabase.from(tableName).delete().eq("id", lastEntry.id);
      if (deleteError) return { error: deleteError.message };
      
      // Update target entry with last entry's data
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          title: lastEntry.title,
          description: lastEntry.description,
        })
        .eq("id", target.id);
        
      if (updateError) return { error: updateError.message };
    }
  }

  revalidatePath("/bbg");
  return { success: true, error: null };
}
