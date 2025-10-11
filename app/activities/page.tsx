"use client";
import React, { useState } from "react";
import MenuLayout from "@/components/menulayout";
import ActivitiesHeader from "./component/Activitiesheader";
import ActivityList from "./component/ActivityList";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MenuLayout title="Activities">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ActivitiesHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <ActivityList searchQuery={searchQuery} />
      </div>
    </MenuLayout>
  );
}
