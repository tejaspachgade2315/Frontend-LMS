"use client";
import MenuLayout from "@/components/menulayout";
import { useState } from "react";
import * as XLSX from "xlsx";
import SalesRepList from "./components/SalesRepList";
import SalesRepHeader from "./components/salesrepheader";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filteredSalesReps, setFilteredSalesReps] = useState([]);
  const handleProductAdded = () => {
    setRefresh(true);
  };

  const handleproductrefresh = () => {
    setRefresh(false);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredSalesReps.map((salesRep: any) => ({
        Name: salesRep.name,
        Email: salesRep.email,
        Phone: salesRep.phone,
        Gender: salesRep.gender,
        Role: salesRep.role,
        Address: salesRep.address,
        " Member Since": salesRep.createdAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Representatives");
    XLSX.writeFile(workbook, "salesRepresentatives.xlsx", { type: "buffer" });
  };

  return (
    <MenuLayout title="Sales Representative">
      <div className="flex-1 space-y-2 p-8 pt-4">
        <SalesRepHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onadded={handleProductAdded}
          onExcel={handleExportToExcel}
        />
        <SalesRepList
          searchQuery={searchQuery}
          onRefresh={handleproductrefresh}
          refresh={refresh}
          setFilteredSalesReps={setFilteredSalesReps}
        />
      </div>
    </MenuLayout>
  );
}
