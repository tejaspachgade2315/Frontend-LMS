"use client";
import MenuLayout from "@/components/menulayout";
import { useState } from "react";
import * as XLSX from "xlsx";
import Contactheader from "./component/contactheader";
import ContactList from "./component/contactList";

export default function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredContacts.map((contact: any) => ({
        Name: contact.name,
        Email: contact.email,
        Phone: contact.phone,
        Gender: contact.gender,
        Company: contact.company,
        Status: contact.status,
        LeadSource: contact.lead_source,
        AssignedTo: contact.assignedTo.name,
        Description: contact.description,
        Products: contact.products
          .map((product: any) => product.name)
          .join(", "),
        CreatedBy: contact.createdby.name,
        CreatedAt: contact.createdAt,
        UpdatedAt: contact.updatedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "contacts.xlsx", { type: "buffer" });
  };

  return (
    <MenuLayout title="Contact">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Contactheader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExcel={handleExportToExcel}
        />
        <ContactList
          searchQuery={searchQuery}
          setFilteredContacts={setFilteredContacts}
        />
      </div>
    </MenuLayout>
  );
}
