import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/token";
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Pencil,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EditProductModal from "./editProductModal";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  productImage?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface ProductListProps {
  searchQuery: string;
  refresh: boolean;
  onRefresh: () => void;
  setFilteredProducts: any;
}
const itemsPerPage = 4;

export default function ProductList({
  searchQuery,
  refresh,
  onRefresh,
  setFilteredProducts,
}: ProductListProps) {
  const [productData, setProductData] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // pagination
  const [error, setError] = useState(false);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchProduct();
  };
  const fetchProduct = async () => {
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<{ products: Product[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          params: {
            limit: pageLimit,
            page: currentPage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProductData(response.data.products);
      setLoading(false);
      setError(false);
      onRefresh();
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [pageLimit, currentPage, totalPage, refresh === true]);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iseditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, seteditId] = useState<string | null>();
  const handleClose = () => setIsModalOpen(false);
  const handleEditClose = () => setIsEditModalOpen(false);

  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    const token = getToken("authToken");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${selectedProduct._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchProduct();
      setIsDeleteModalOpen(false);
      toast("Product deleted Succesfully", "Success", {
        title: "Product deleted",
        description: "Product deleted Succesfully.",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast("Productnot deleted Succesfully", "Error", {
        title: "Server Error",
        description: error.response.data.message,
        duration: 2000,
      });
    }
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

  const filteredProducts = useMemo(() => {
    return productData.filter(
      (product) =>
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        product.price.toString().includes(debouncedSearch) ||
        product.stock.toString().includes(debouncedSearch)
    );
  }, [productData, debouncedSearch]);

  useEffect(() => {
    setFilteredProducts(filteredProducts);
  }, [filteredProducts, setFilteredProducts]);

  return (
    <div className="flex-1 space-y-4">
      <div className="max-sm:hidden">
        {loading ? (
          // Improved skeleton loader in table format
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Image",
                  "Name",
                  "Description",
                  "Price",
                  "Stock",
                  "Actions",
                ].map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="w-10 h-10 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-32 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-48 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-16 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-16 h-6" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="w-8 h-8 rounded" />
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load products. Please try again.
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
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-gray-500 text-center"
                      colSpan={6}
                    >
                      No Product Data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product) => (
                    <TableRow
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <TableCell>
                        <img
                          src={
                            product.productImage || "/placeholder-image.webp"
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell onClick={() => setIsModalOpen(true)}>
                        {product.name}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        <TableCell onClick={() => setIsModalOpen(true)}>
                          <p className="max-w-[300px] max-nd:max-w-[150px] truncate">
                            {product.description.length > 50
                              ? product.description.substring(0, 50) + "..."
                              : product.description}
                          </p>
                        </TableCell>
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        ₹{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        {product.stock}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsEditModalOpen(true);
                            seteditId(product._id);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <EditProductModal
              isOpen={iseditModalOpen}
              onClose={handleEditClose}
              editId={editId}
              onRefresh={fetchProduct}
            />

            {/* Pagination Controls */}
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
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg">
              Failed to load products. Please try again.
            </p>
            <Button onClick={handleRetry} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-start bg-white p-4 space-x-4 border-b"
              onClick={() => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
            >
              <div className="flex-shrink-0">
                <img
                  src={product.productImage || "/placeholder-image.webp"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-lg font-medium">{product.name}</p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center pt-1">
                  <p className="text-sm font-semibold">
                    ₹{product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.stock} in stock
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                    seteditId(product._id);
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
                    handleDeleteClick(product);
                  }}
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedProduct?.name}?</p>
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
