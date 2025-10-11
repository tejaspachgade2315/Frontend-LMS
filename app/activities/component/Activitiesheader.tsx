import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
export default function ActivitiesHeader({
  searchQuery,
  setSearchQuery,
}: SearchProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Activities
      </h2>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <div className="flex items-center w-full sm:w-auto border rounded-lg overflow-hidden">
          <Input
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border border-none focus:ring-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="px-2">
              ✖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
