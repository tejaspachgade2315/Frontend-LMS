import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import AddLeadModal from "../all/component/addlead";

export default function Leadtrackingheader() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const handleClose = () => setIsLeadModalOpen(false);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between sm:gap-0">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Lead Tracking
      </h2>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        {/* <div className="flex items-center w-full sm:w-auto border rounded-lg overflow-hidden">
        <Input placeholder="Search..." className="w-full sm:w-64 border-none focus:ring-0" />
        <Button variant="outline" className="rounded-none">
          <Search className="w-5 h-5" />
        </Button>
      </div> */}
        <Button
          className="w-full sm:w-auto mr-2.5"
          onClick={() => {
            setIsLeadModalOpen(true);
          }}
        >
          Add Leads
        </Button>
        <AddLeadModal isOpen={isLeadModalOpen} onClose={handleClose} />
      </div>
    </div>
  );
}
