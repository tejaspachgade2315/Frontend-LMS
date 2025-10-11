"use client";
import AddActivityModal from "@/components/compo/addactvityModal";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getToken } from "@/lib/token";
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Deletelead from "./deletelead";
import Editlead from "./editlead";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  gender: string;
  address: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Lead {
  oldStatus: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  company: string;
  status: string;
  lead_source: string;
  assignedTo: User;
  description: string;
  products: any[];
  createdby: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface ConvertedLeadsProps {
  searchQuery: string;
  setdata: any;
}

export default function Convertedleadlist({
  searchQuery,
  setdata,
}: ConvertedLeadsProps) {
  const [convertedLeads, setConvertedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // pagination
  const [error, setError] = useState(false);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPage) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchAllLead = async () => {
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<{
        leads: Lead[];
        pagination: Pagination;
      }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/converted`, {
        params: {
          limit: pageLimit,
          page: currentPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setConvertedLeads(response.data.leads);
      setPageLimit(response.data.pagination.pageSize);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPage(response.data.pagination.totalPages);
      setError(false);
    } catch (error) {
      console.error("Error fetching sales representatives:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLead();
  }, []);

  const [editopen, seteditopen] = useState(false);
  const [selectleadid, setselectleadid] = useState<string>();
  const edithandle = async () => {
    seteditopen(false);
    setselectleadid("");
  };

  // delete
  const [deleteopen, setdeleteopen] = useState(false);
  const [selectdeleteid, setselectdeleteid] = useState<string | undefined>();
  const [selectname, setselectname] = useState<string | undefined>();

  const handelclose = () => {
    setdeleteopen(false);
    setselectdeleteid("");
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchAllLead();
  };

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  });

  const filteredLeads = useMemo(() => {
    return convertedLeads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.phone.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.status.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.lead_source
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        lead.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        lead.company.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.assignedTo?.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
    );
  }, [convertedLeads, debouncedSearch]);

  useEffect(() => {
    setdata(filteredLeads);
  }, [filteredLeads, setdata]);

  const [activityID, setActivityID] = useState<string | undefined>();
  const [activityOpen, setActivityOpen] = useState(false);

  const handleactivityclose = () => {
    setActivityOpen(false);
    setActivityID("");
  };

  
  return (
    <div className="flex-1 space-y-4">
      <div className="max-sm:hidden">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Name",
                  "Status",
                  "Email",
                  "Phone",
                  "Product",
                  "Description",
                  "Lead Source",
                  "Assigned To",
                  "Actions",
                ].map((head) => (
                  <TableHead key={head}>{head}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(9)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="w-full h-6" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load converted leads.
            </p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Lead Source</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-gray-500 text-center"
                      colSpan={9}
                    >
                      No Converted Lead found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads?.map((lead: Lead) => (
                    <TableRow key={lead._id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        {lead.products && lead.products.length > 0
                          ? lead.products
                              .map((product) => product.name)
                              .join(", ")
                          : "No Products"}
                      </TableCell>
                      <TableCell>{lead.description}</TableCell>
                      <TableCell>{lead.lead_source}</TableCell>
                      <TableCell>{lead.assignedTo?.name}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            seteditopen(true);
                            setselectleadid(lead._id);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setdeleteopen(true);
                            setselectdeleteid(lead._id);
                            setselectname(lead.name);
                          }}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setActivityOpen(true);
                            setActivityID(lead._id);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end px-4">
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
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
                  Page {currentPage} of {totalPage}
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
                    disabled={currentPage === totalPage || loading}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => handlePageChange(totalPage)}
                    disabled={currentPage === totalPage || loading}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sm:hidden space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-[140px] w-full rounded-lg" />
            <Skeleton className="h-[140px] w-full rounded-lg" />
            <Skeleton className="h-[140px] w-full rounded-lg" />
            <Skeleton className="h-[140px] w-full rounded-lg" />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load converted leads.
            </p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No converted leads found.
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white p-4 border rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.email}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Converted
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p>{lead.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Source</p>
                  <p>{lead.lead_source || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Assigned To</p>
                  <p>{lead.assignedTo?.name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Products</p>
                  <p className="line-clamp-1">
                    {lead.products?.length > 0
                      ? lead.products.map((p) => p.name).join(", ")
                      : "None"}
                  </p>
                </div>
              </div>

              {lead.description && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm line-clamp-2">{lead.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    seteditopen(true);
                    setselectleadid(lead._id);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setdeleteopen(true);
                    setselectdeleteid(lead._id);
                    setselectname(lead.name);
                  }}
                >
                  <Trash className="h-4 w-4 mr-1 text-red-500" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActivityOpen(true);
                    setActivityID(lead._id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Activity
                </Button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPage > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} of {totalPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPage || loading}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPage)}
              disabled={currentPage === totalPage || loading}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Editlead isOpen={editopen} onClose={edithandle} leadid={selectleadid} />

      <Deletelead
        isOpen={deleteopen}
        onClose={handelclose}
        leadid={selectdeleteid}
        leadname={selectname}
      />

      <AddActivityModal
        isOpen={activityOpen}
        onClose={handleactivityclose}
        leadid={activityID}
        onAddActivity={() => {}}
      />
    </div>
  );
}
