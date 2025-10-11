"use client";
import AddActivityModal from "@/components/compo/addactvityModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/token";
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Activity {
  _id: string;
  type: "call" | "email" | "meeting" | "follow-up" | "other";
  subject: string;
  description: string;
  status: "pending" | "completed" | "canceled" | "scheduled";
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  activities: Activity[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface ActivityListProps {
  searchQuery: string;
}

export default function ActivityList({ searchQuery }: ActivityListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState<{
    isOpen: boolean;
    prefilledData?: {
      type: Activity["type"];
      subject: string;
    };
  }>({ isOpen: false });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchActivities();
  };

  const fetchActivities = async () => {
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<{
        activities: Lead[];
        pagination: Pagination;
      }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/`, {
        params: {
          limit: pageLimit,
          page: currentPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeads(response.data.activities);
      setPageLimit(response.data.pagination.pageSize);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setError(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(true);
      toast("Failed to fetch activities", "Error", {
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pageLimit, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      return (
        lead.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.activities?.some((activity) =>
          activity.subject
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
      );
    });
  }, [leads, debouncedSearch]);

  const handleStatusChange = async (activityId: string, newStatus: string) => {
    setUpdatingId(activityId);
    const previousLeads = [...leads];

    try {
      const token = getToken("authToken");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${activityId}`,
        { status: newStatus.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic update
      setLeads((prev) =>
        prev.map((lead) => ({
          ...lead,
          activities: lead.activities.map((activity) =>
            activity._id === activityId
              ? {
                  ...activity,
                  status: newStatus.toLowerCase() as Activity["status"],
                }
              : activity
          ),
        }))
      );

      toast("Activity status updated to " + newStatus, "Success", {
        title: "Success",
        description: `Activity status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating activity status:", error);
      setLeads(previousLeads);
      toast("Failed to update activity status", "Error", {
        title: "Error",
        description: "Failed to update activity status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddActivity = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActivityModalOpen({ isOpen: true });
  };

  return (
    <div className="flex-1 space-y-4">
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-[70px] w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 text-lg">Failed to load activities.</p>
          <Button onClick={handleRetry} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No activities found.
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4 p-4">
          {filteredLeads.map((lead) => (
            <AccordionItem
              key={lead._id}
              value={lead._id}
              className=" overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 border rounded-lg">
                <div className="flex items-center justify-between w-full gap-1">
                  <div className="text-left">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {lead.activities?.length || 0} activities
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{lead.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Activities</p>
                      <p>{lead.activities?.length || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {lead.activities?.map((activity) => (
                      <div
                        key={activity._id}
                        className="p-3 border rounded-lg space-y-2 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium capitalize">
                              {activity.type}
                            </p>
                            <p className="text-sm">{activity.subject}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full capitalize ${
                              activity.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : activity.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500">
                          {activity?.description || "No description"}
                        </p>

                        <div className="flex justify-between text-sm text-gray-500">
                          <p>
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                          <p>By {activity.createdBy?.name}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-6 bottom-12"
                              onClick={() => {
                                setSelectedLeadId(lead._id);
                                setActivityModalOpen({
                                  isOpen: true,
                                  prefilledData: {
                                    type: activity.type,
                                    subject: `Re: ${activity.subject}`,
                                  },
                                });
                              }}
                            >
                              <Plus className="h-12 w-12 border" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Create follow-up activity</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLeadId(lead._id);
                        setActivityModalOpen({ isOpen: true });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-end px-4">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {pageLimit} Rows per page
            </Label>
            <Select
              value={String(pageLimit)}
              onValueChange={(value) => {
                setPageLimit(Number(value));
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={pageLimit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>

      <AddActivityModal
        isOpen={activityModalOpen.isOpen}
        onClose={() => setActivityModalOpen({ isOpen: false })}
        leadid={selectedLeadId}
        prefilledData={activityModalOpen.prefilledData}
        onAddActivity={fetchActivities}
      />
    </div>
  );
}
