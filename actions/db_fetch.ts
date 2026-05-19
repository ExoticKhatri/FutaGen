// actions/db_fetch.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { TraitCategory, TRAIT_CATEGORIES, TraitVariant } from "@/types/traits";

/**
 * 1. Fetch all rows and columns for a specific table
 */
export async function fetchAllFromTable(tableName: TraitCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("base10_map", { ascending: true });

  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return { data: null, error };
  }

  return { data: data as TraitVariant[], error: null };
}

/**
 * 2. Fetch specific columns from every table
 */
export async function fetchSpecificColumnsFromAllTables(columns: string[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const selectQuery = columns.join(", ");

  const promises = TRAIT_CATEGORIES.map(async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select(selectQuery)
      .order("base10_map", { ascending: true });
      
    return { table, data, error };
  });

  return Promise.all(promises);
}

/**
 * 3. Fetch specific entry from a specific column from a specific table
 * Resolved: "Conversion may be a mistake" by using double-casting and existence checks.
 */
export async function fetchSpecificEntryColumn(
  tableName: TraitCategory, 
  column: string, 
  base36_map: string
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select(column)
    .eq("base36_map", base36_map)
    .single();

  if (error) {
    console.error(`Error fetching ${column} from ${tableName} for ${base36_map}:`, error);
    return { data: null, error };
  }

  // Handle potential null/undefined from Supabase
  if (!data) return { data: null, error: null };

  // Double cast: first to unknown, then to Record to satisfy the 'overlap' check
  const typedData = data as unknown as Record<string, unknown>;

  return { 
    data: column in typedData ? typedData[column] : null, 
    error: null 
  };
}