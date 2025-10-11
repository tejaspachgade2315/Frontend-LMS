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
import { useToast } from "@/hooks/use-toast";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onadded: () => void;
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  stock: z.number().min(1, "Stock must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  image: z.instanceof(File, { message: "Product image is required" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductModal({
  isOpen,
  onClose,
  onadded
}: ModalComponentProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("image", file, { shouldValidate: true });
    } else {
      setImagePreview(null);
    }
  };
  // toast
  const { toast } = useToast();
  const onSubmit = async (data: ProductFormValues) => {
    setErrorMessage(null);

    const token = getToken("authToken");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    if (selectedFile) {
      formData.append("productImage", selectedFile);
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      reset();
      setSelectedFile(null);
      setImagePreview(null);
      onClose();
      onadded();
      toast("Product added succesfully", "Success", {
        title: "Product added succesfully",
        description: "Product added Succesfully.",
        duration: 2000,
      });
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      toast("Product not added succesfully", "Error", {
        title: "Server Error",
        description: error.response.data.message,
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto w-full mx-auto p-6 ">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Product
          </DialogTitle>
        </DialogHeader>
        {errorMessage && (
          <div className="bg-red-100 text-red-600 p-2 rounded-md">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} className="w-full" />
            {errors.name && (
              <span className="text-red-600">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full"
            />
            {errors.price && (
              <span className="text-red-600">{errors.price.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              className="w-full"
            />
            {errors.description && (
              <span className="text-red-600">{errors.description.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="w-full"
            />
            {errors.stock && (
              <span className="text-red-600">{errors.stock.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {errors.image && (
              <span className="text-red-600">{errors.image.message}</span>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-full max-w-xs h-40 object-cover rounded-md mx-auto"
              />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
