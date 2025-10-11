"use client";
import MenuLayout from "@/components/menulayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import * as XLSX from "xlsx";
import AllLeadHeader from "./component/allleadheader";
import Allleadlist from "./component/allleadlist";
import Convertedleadlist from "./component/convertedleadlist";
import Lossleadlist from "./component/lossleadlist";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setdata] = useState([]);

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((lead: any) => ({
        Name: lead.name,
        Email: lead.email,
        Phone: lead.phone,
        Gender: lead.gender,
        Company: lead.company,
        Status: lead.status,
        LeadSource: lead.lead_source,
        AssignedTo: lead.assignedTo.name,
        Description: lead.description,
        Products: lead.products.map((product: any) => product.name).join(", "),
        CreatedBy: lead.createdby,
        CreatedAt: lead.createdAt,
        UpdatedAt: lead.updatedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "allleads.xlsx");
  };


  return (
    <MenuLayout title="All Leads">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AllLeadHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExcel={handleExportToExcel}
        />
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All leads</TabsTrigger>
            <TabsTrigger value="converted">Converted leads</TabsTrigger>
            <TabsTrigger value="loss">Loss leads</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Allleadlist searchQuery={searchQuery} setdata={setdata} />
          </TabsContent>
          <TabsContent value="converted">
            <Convertedleadlist searchQuery={searchQuery} setdata={setdata} />
          </TabsContent>
          <TabsContent value="loss">
            <Lossleadlist searchQuery={searchQuery} setdata={setdata} />
          </TabsContent>
        </Tabs>
      </div>
    </MenuLayout>
  );
}
