// app/lab/page.tsx

import { fetchAllFromTable } from "@/actions/db_fetch";
import { TRAIT_CATEGORIES, TraitCategory } from "@/types/traits";
import LabHeader from "@/components/Lab/Header";
import LabTableList from "@/components/Lab/List";
import UploadModal from "@/components/Lab/Upload/UploadModal"; // Import your modal

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; action?: string }>;
}) {
  const params = await searchParams;
  const tableParam = params.table as TraitCategory;
  
  // Check if the URL has ?action=insert
  const isModalOpen = params.action === "insert";

  const activeTable = TRAIT_CATEGORIES.includes(tableParam) 
    ? tableParam 
    : "body";

  const { data, error } = await fetchAllFromTable(activeTable);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#050505] text-zinc-400 p-4 space-y-3">
      {/* 1. Pass activeTable to header */}
      <LabHeader activeTable={activeTable} />

      <main className="flex-1 flex overflow-hidden">
          <LabTableList 
            initialData={data || []} 
            activeTable={activeTable}
            serverError={error?.message}
          />
      </main>

      {/* 2. Modal controlled by URL param */}
      <UploadModal 
        isOpen={isModalOpen} 
        activeTable={activeTable} 
        // Logic to close: push the current URL without the 'action' param
      />
    </div>
  );
}