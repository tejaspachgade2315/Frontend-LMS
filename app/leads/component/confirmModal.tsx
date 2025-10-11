import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/token";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  leadchangedata: any;
  onError: () => void;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  productImage?: string;
}

interface productOptions {
  value: string;
  label: string;
}

export const wonupdate = async () => {};

export default function ConfirmProductModal({
  isOpen,
  onClose,
  leadchangedata,
  onError,
}: ModalComponentProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<productOptions[]>([]);

  const fetchProducts = async () => {
    try {
      const token = getToken("authToken");
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Transform API response into { value, label } format
      const options = resp.data.products.map((product: Product) => ({
        value: product._id,
        label: product.name,
      }));

      setProductOptions(options);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProductField = () => {
    setProducts([
      ...products,
      { id: Date.now().toString(), product: "", productLabel: "", quantity: 1 },
    ]);
  };

  const updateProduct = (
    id: string,
    updates: Partial<{
      product: string;
      productLabel: string;
      quantity: number;
    }>
  ) => {
    setProducts(
      products.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeProductField = (id: string) => {
    setProducts(products.filter((item) => item.id !== id));
  };
  const { toast } = useToast();

  const handleConfirm = async () => {
    const confirmProduct = products.map((item) => ({
      id: item.product,
      product: item.productLabel,
      quantity: item.quantity,
    }));

    const token = getToken("authToken");

    try {
      const responce = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/won/` +
          leadchangedata?.draggableId,
        {
          confirmedProducts: confirmProduct,
          status: "won",
          index: leadchangedata?.destination?.index,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to confirm products.";
      toast("Issue in status Update", "Error", {
        title: "Issue in status Update",
        description: errorMessage,
        duration: 2000,
      });
      onError();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Product & Quantity</DialogTitle>
          <div className="flex flex-row items-center justify-between">
            <DialogDescription>
              Select a product and enter quantity.
            </DialogDescription>
            <Button onClick={addProductField}>Add Product</Button>
          </div>
        </DialogHeader>

        {products.map(({ id, product, productLabel, quantity }) => (
          <div key={id} className="flex flex-row gap-2 my-2 items-center">
            <Select
              onValueChange={(value) => {
                const selectedProduct = productOptions.find(
                  (item) => item.value === value
                );
                updateProduct(id, {
                  product: value,
                  productLabel: selectedProduct?.label || "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={productLabel || "Select a Product"} />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) =>
                updateProduct(id, { quantity: Number(e.target.value) })
              }
              placeholder="Enter Quantity"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeProductField(id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              products.length === 0 ||
              products.some((p) => !p.product || p.quantity <= 0)
            }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
