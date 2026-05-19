"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { TraitCategory } from "@/types/traits";
import { revalidatePath } from "next/cache";



export async function insertEntry(
  tableName: TraitCategory,
  entry: { title: string; description: string }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: lastEntry } = await supabase
    .from(tableName)
    .select("base10_map")
    .order("base10_map", { ascending: false })
    .limit(1)
    .single();

  const nextBase10 = lastEntry ? lastEntry.base10_map + 1 : 1;
  const base36_map = nextBase10.toString(36).padStart(3, "0");

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      base36_map,
      base10_map: nextBase10,
      title: entry.title,
      description: entry.description,
    })
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    return { error: error.message };
  }

  revalidatePath("/bbg");
  return { data, error: null };
}

export async function bulkInsertEntries(
  tableName: TraitCategory,
  entries: { title: string; description: string }[]
) {
  if (!entries.length) return { data: [], error: null };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: lastEntry } = await supabase
    .from(tableName)
    .select("base10_map")
    .order("base10_map", { ascending: false })
    .limit(1)
    .single();

  let nextBase10 = lastEntry ? lastEntry.base10_map + 1 : 1;
  const payload = entries.map((entry) => {
    const base36_map = nextBase10.toString(36).padStart(3, "0");
    const item = {
      base36_map,
      base10_map: nextBase10,
      title: entry.title,
      description: entry.description,
    };
    nextBase10++;
    return item;
  });

  const { data, error } = await supabase
    .from(tableName)
    .insert(payload)
    .select();

  if (error) {
    console.error(`Error bulk inserting into ${tableName}:`, error);
    return { error: error.message };
  }

  revalidatePath("/bbg");
  return { data, error: null };
}
