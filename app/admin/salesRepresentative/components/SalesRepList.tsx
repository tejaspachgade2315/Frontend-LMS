"use client";
import React, { useEffect, useState, useMemo, use } from "react";
import MenuLayout from "@/components/menulayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsLeftIcon,
  ChevronsRight,
  ChevronsRightIcon,
  Pencil,
  Trash,
} from "lucide-react";
import axios from "axios";
import { getToken } from "@/lib/token";
import ProfileModal from "./ProfileModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditsalesRepModal from "./editsalesRepModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface SalesRep {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  sales: number;
  profilePic: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface SalesRepListProps {
  searchQuery: string;
  onRefresh: () => void;
  refresh: boolean;
  setFilteredSalesReps: any;
}
// const itemsPerPage = 4;

export default function SalesRepList({ searchQuery , onRefresh , refresh, setFilteredSalesReps }: SalesRepListProps) {
  const [salesRepData, setSalesRepData] = useState<SalesRep[]>([]);
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  // pagination
  const [error, setError] = useState(false);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const fetchSalesRepresentatives = async () => {
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<{
        salesReps: SalesRep[];
        pagination: Pagination;
      }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/salesreps/`, {
        params: {
          limit: pageLimit,
          page: currentPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
   
      setSalesRepData(response.data.salesReps);
      setPageLimit(response.data.pagination.pageSize);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPage(response.data.pagination.totalPages);
      setError(false);
      onRefresh();
    } catch (error) {
      console.error("Error fetching sales representatives:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesRepresentatives();
  }, [pageLimit, currentPage, totalPage , (refresh === true)]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iseditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, seteditId] = useState<string | null>();

  const handleClose = () => setIsModalOpen(false);
  const handleEditClose = () => setIsEditModalOpen(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleDeleteClick = (rep: SalesRep) => {
    setSelectedRep(rep);
    setIsDeleteModalOpen(true);
  };


  const { toast } = useToast();
  
  const confirmDelete = async () => {
    if (!selectedRep) return;
    const token = getToken("authToken");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${selectedRep._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    

      toast("Sales Representative deleted Succesfully", "Success", {
        title: "Sales Representative deleted",
        description: "Sales Representative deleted Succesfully.",
        duration: 2000,
      });
      fetchSalesRepresentatives();
      setIsDeleteModalOpen(false);
    } catch (error  : any) {
      console.error("Error deleting sales representative:", error);
      toast("Sales Representative not deleted Succesfully", "Error", {
        title: "Server Error",
        description: error.response.data.message,
        duration: 2000,
      });
    }
  };


  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchSalesRepresentatives();
  };

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

  const filteredSalesReps = useMemo(() => {
    return salesRepData.filter(
      (rep) =>
        rep.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rep.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rep.phone.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rep.gender.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [salesRepData, debouncedSearch]);

  useEffect(() => {
    setFilteredSalesReps(filteredSalesReps);
  },[filteredSalesReps, setFilteredSalesReps]);

  return (
    <div className="flex-1 space-y-4">
      <div className="max-sm:hidden">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Photo",
                  "Name",
                  "Email",
                  "Phone No.",
                  "Gender",
                  "Actions",
                ].map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load sales representatives. Please try again.
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
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone No.</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalesReps.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-gray-500 text-center"
                      colSpan={6}
                    >
                      No sales representatives found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalesReps.map((rep) => (
                    <TableRow
                      key={rep._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedUserId(rep._id);
                        setProfileModalOpen(true);
                        setSelectedRep(rep);
                      }}
                    >
                      <TableCell>
                        <img
                          src={rep.profilePic}
                          alt={rep.name}
                          className="w-10 h-10 rounded-full"
                        />
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        {rep.name}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        {rep.email}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        {rep.phone}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        {rep.gender.charAt(0).toUpperCase() + rep.gender.slice(1)}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditModalOpen(true);
                            seteditId(rep._id);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(rep);
                          }}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* pagination */}
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
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load sales representatives. Please try again.
            </p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredSalesReps.length === 0 ? (
          <> No sales representatives found.</>
        ) : (
          filteredSalesReps.map((rep: any) => (
            <div
              key={rep._id}
              className="flex items-center bg-white p-4 space-x-4 border-b"
              onClick={() => {
                setSelectedUserId(rep._id);
                setProfileModalOpen(true);
                setSelectedRep(rep);
              }}
            >
              <img
                src={rep.profilePic}
                alt={rep.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 flex-col">
                <p className="text-lg font-medium">{rep.name}</p>
                <p className="text-sm text-gray-500">{rep.email}</p>
                <p className="text-sm text-gray-500">{rep.phone}</p>
                <p className="text-sm text-gray-500">{rep.gender}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                    seteditId(rep._id);
                  }}
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(rep);
                  }}
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedUserId || ""}
      />

      <EditsalesRepModal
        isOpen={iseditModalOpen}
        onClose={handleEditClose}
        editId={editId}
        onRefresh={fetchSalesRepresentatives}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedRep?.name}?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
