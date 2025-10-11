"use client";
import React, { useState } from "react";
import MenuLayout from "@/components/menulayout";
import Productheader from "./components/productheader";
import ProductList from "./components/ProductList";
import * as XLSX from "xlsx";


export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts,setFilteredProducts] = useState([]);

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((product: any) => ({
        Name: product.name,
        Description: product.description,
        Price: product.price,
        Stock: product.stock,
        CreatedAt: product.createdAt
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx", { type: "buffer" });
  }

  const [refresh, setRefresh] = useState(false);
  const handleProductAdded = () => {
    setRefresh(true);
  };

  const handleproductrefresh = () => {
    setRefresh(false);
  };

  return (
    <MenuLayout title="Product">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Productheader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onadded={handleProductAdded}
          onExcel={handleExportToExcel}
        />
        <ProductList
          searchQuery={searchQuery}
          refresh={refresh}
          onRefresh={handleproductrefresh}
          setFilteredProducts={setFilteredProducts}
        />
      </div>
    </MenuLayout>
  );
}
