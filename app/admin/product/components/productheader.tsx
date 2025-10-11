import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import React, { useState } from "react";
import AddProductModal from "./AddProductModal";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onadded: () => void;
  onExcel: () => void;
}

export default function ProductHeader({
  searchQuery,
  setSearchQuery,
  onadded,
  onExcel,
}: SearchProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = () => setIsModalOpen(false);
  const handleProductAdded = () => {
    onadded();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between  sm:gap-0">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Product</h2>
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
            setIsModalOpen(true);
          }}
        >
          Add Product
        </Button>
        <Button
          onClick={() => {
            onExcel();
          }}
        >
          <Download />
        </Button>
        <AddProductModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onadded={handleProductAdded}
        />
      </div>
    </div>
  );
}
