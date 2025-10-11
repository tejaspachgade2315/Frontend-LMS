import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import React, { useState } from "react";
import AddLeadModal from "./addlead";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExcel: () => void;
}

export default function Allleadheader({
  searchQuery,
  setSearchQuery,
  onExcel,
}: SearchProps) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClose = () => setIsLeadModalOpen(false);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between  sm:gap-0">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Leads </h2>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <div className="flex items-center w-full sm:w-auto border rounded-lg overflow-hidden">
          <Input
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border-none focus:ring-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="px-2">
              ✖
            </button>
          )}
          {/* <Button variant="outline" className="rounded-none">
            <Search className="w-5 h-5" />
          </Button> */}
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setIsLeadModalOpen(true);
          }}
        >
          Add Leads
        </Button>
        <Button
          onClick={() => {
            onExcel();
          }}
        >
          <Download />
        </Button>
      </div>
      <AddLeadModal isOpen={isLeadModalOpen} onClose={handleClose} />
    </div>
  );
}
