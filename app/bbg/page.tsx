import { fetchAllFromTable } from "@/actions/db_fetch";
import { TRAIT_CATEGORIES, TraitCategory } from "@/types/traits";
import TableEditor from "./TableEditor";

export default async function BBGPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const params = await searchParams;
  const tableParam = params.table as TraitCategory;
  
  // Ensure the table is valid, otherwise default to "body"
  const activeTable = TRAIT_CATEGORIES.includes(tableParam) ? tableParam : "body";

  // Fetch only the single active table's data
  const { data, error } = await fetchAllFromTable(activeTable);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
            Database Editor
          </h1>
          <p className="text-neutral-400 text-lg font-medium">
            Manage your Supabase trait data, table by table.
          </p>
        </header>

        <TableEditor 
          activeTable={activeTable} 
          initialData={data || []} 
          error={error?.message}
          allTables={TRAIT_CATEGORIES}
        />
      </div>
    </main>
  );
}
