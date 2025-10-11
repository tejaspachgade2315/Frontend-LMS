"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null | undefined;
  onRefresh: () => void;
}

interface Product {
  name: string;
  price: number;
  stock: number;
  description: string;
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  stock: z.number().min(1, "Stock must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  image: z.instanceof(File, { message: "Product image is required" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductModal({
  isOpen,
  onClose,
  editId,
  onRefresh,
}: ModalComponentProps) {
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImage(file);
      setProduct((prev: Product) => ({ ...prev, image: file }));
    }
  };

  const fetchEditData = async () => {
    if (!editId) return;
    setLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<any, any>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${editId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProduct({
        name: response.data.name || "",
        price: response.data.price || 0,
        stock: response.data.stock || 0,
        description: response.data.description || "",
      });

      if (response.data.productImage) {
        setImagePreview(response.data.productImage);
      }
    } catch (error) {
      console.error("Error fetching sales rep data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchEditData();
    }
  }, [editId, isOpen]);

  // toast
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisabled(true);
    setErrorMessage(null);

    const token = getToken("authToken");
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString());
    if (image) {
      formData.append("productImage", image);
    } else {
      if (imagePreview) {
        formData.append("productImage", imagePreview);
      }
    }
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/` + editId,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsDisabled(false);
      setProduct({
        name: "",
        price: 0,
        stock: 0,
        description: "",
      });
      setImage(null);
      setImagePreview(null);
      onClose();
      onRefresh();
      toast("Product edited Succesfully", "Success", {
        title: "Product add",
        description: "Product added Succesfully.",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error adding product:", error);

      // Handle different error cases
      if (error.response) {
        // Backend responded with an error
        setErrorMessage(
          error.response.data.message || "Failed to add product."
        );
      } else if (error.request) {
        // No response received
        setErrorMessage("No response from server   . Please try again.");
      } else {
        // Other errors
        setErrorMessage("Something went wrong. Please try again.");
      }

      toast("Product not edited Succesfully", "Error", {
        title: "Server Error",
        description: error.response.data.message,
        duration: 2000,
      });
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto w-full mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Product
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-100 text-red-600 p-2 rounded-md">
                {errorMessage}
              </div>
            )}

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 w-full max-w-xs h-40 object-cover rounded-md mx-auto"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2"
                disabled={isDisabled}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-4 py-2" disabled={isDisabled}>
                {isDisabled ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
