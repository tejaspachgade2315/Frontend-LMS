import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  leadid: string | null | undefined;
}

interface Lead {
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

export default function Editlead({
  isOpen,
  onClose,
  leadid,
}: ModalComponentProps) {
  const [lead, setLead] = useState<Partial<Lead>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isdisabled, setIsdisabled] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);
  const [productOptions, setProductOptions] = useState<productOptions[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const fetchuser = async () => {
    setLoading(true);
    try {
      const token = getToken("authToken");
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/salesreps/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(resp.data.salesReps);
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

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

  const fetchlead = async () => {
    try {
      const token = getToken("authToken");
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/` + leadid,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLead(resp.data.lead);
      const selected = resp.data.lead.products.map((product: Product) => ({
        value: product._id,
        label: product.name, // Ensure product name is available
      }));

      setSelectedProducts(selected);

      //   resp.data.products.map((product: Product) => ({
      //     value: product._id,
      //     label: product.name,
      //   }));

      //   setProductOptions(options);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchuser();
    fetchProducts();
    fetchlead();
  }, [isOpen]);

  const handleSelectChange = (key: keyof Lead, value: string) => {
    setLead((prevLead) => ({
      ...prevLead,
      [key]: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLead((prevLead) => ({
      ...prevLead,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenderChange = (value: string) => {
    setLead((prevLead) => ({
      ...prevLead,
      gender: value,
      status: "new",
    }));
  };

  const handleStatusChange = (value: string) => {
    setLead((prevLead) => ({
      ...prevLead,
      status: value,
    }));
  };

  const handleProductChange = (selectedOptions: any) => {
    setSelectedProducts(selectedOptions);
    setLead((prevLead) => ({
      ...prevLead,
      products: selectedOptions.map((option: any) => option.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken("authToken");
    setIsdisabled(true);

    try {
      const responce = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/` + leadid,
        lead,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
      setIsdisabled(false);
      setImage(null);
      setImagePreview(null);
      setLead({});
      onClose();
    } catch (error) {
      console.error("Error registering sales representative:", error);
    } finally {
      setIsdisabled(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Lead</DialogTitle>
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
            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={lead?.name || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={lead?.email || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={lead?.phone || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  required
                  value={lead?.company || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Lead Source */}
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead Source</Label>
                <Input
                  id="lead_source"
                  name="lead_source"
                  required
                  value={lead?.lead_source || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={lead?.status}
                  onValueChange={(value) => handleStatusChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="proposalsent">Proposal Sent</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Multi-Select */}
            <div className="space-y-2">
              <Label>Select Products</Label>
              <ReactSelect
                options={productOptions}
                isMulti
                value={selectedProducts}
                onChange={handleProductChange}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <div className="border border-gray-300 rounded-md p-1 px-3 text-gray-700">
                  {lead?.assignedTo?.name || "Not Assigned"}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={lead?.gender}
                  onValueChange={(value) => handleGenderChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned To */}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={lead?.description || ""}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isdisabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isdisabled}>
                Edit
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
