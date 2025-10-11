"use client";
import { AvatarFallback } from "@/components/ui/avatar";
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
import { Avatar } from "@radix-ui/react-avatar";
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";


interface Contact {
  oldStatus: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  company: string;
  status: string;
  lead_source: string;
  assignedTo: AssignedUser;
  description: string;
  products: Product[];
  createdby: owner;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface owner {
  name: string;
}

interface AssignedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  gender: "male" | "female" | "other";
  address: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  productImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface ContactListProps {
  searchQuery: string;
  setFilteredContacts: any;
}

// const itemsPerPage = 4;

export default function ContactList({
  searchQuery,
  setFilteredContacts,
}: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchContacts();
  };
  const fetchContacts = async () => {
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<{
        leads: Contact[];
        pagination: Pagination;
      }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/`, {
        params: {
          limit: pageLimit,
          page: currentPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setContacts(response.data.leads);
      setPageLimit(response.data.pagination.pageSize);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPage(response.data.pagination.totalPages);
      setError(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [pageLimit, currentPage, totalPage]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPage) {
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

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.phone.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.company.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.assignedTo?.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        contact.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        contact.createdby.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        contact.gender.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [contacts, debouncedSearch]);

  useEffect(() => {
    setFilteredContacts(filteredContacts);
  }, [filteredContacts, setFilteredContacts]);

 

  return (
    <div className="flex-1 space-y-4">
      <div className="max-sm:hidden">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Name",
                  "Email",
                  "Gender",
                  "Phone",
                  "Company",
                  "Assigned To",
                  "Contact Owner",
                  "Description",
                ].map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(8)].map((_, i) => (
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
            <p className="text-red-500 text-lg">Failed to load contacts.</p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Contact Owner</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No Contacts Found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts?.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.gender}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.assignedTo?.name || "NA"}</TableCell>
                    <TableCell>{contact.createdby?.name || "NA"}</TableCell>
                    <TableCell>{contact.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
      </div>

      <div className="sm:hidden space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">Failed to load contacts.</p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No contacts found.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="flex items-start bg-white p-4 border rounded-lg shadow-sm"
            >
              <div className="flex-shrink-0 mr-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
                    {contact.gender}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p>{contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p>{contact.company || "NA"}</p>
                  </div>
                  {/* <div>
              <p className="text-gray-500">Assigned To</p>
              <p>{contact.assignedTo?.name || "NA"}</p>
            </div> */}
                  <div>
                    <p className="text-gray-500">Owner</p>
                    <p>{contact.createdby?.name || "NA"}</p>
                  </div>
                </div>

                {contact.description && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm line-clamp-2">
                      {contact.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPage > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} / {totalPage}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPage || loading}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
