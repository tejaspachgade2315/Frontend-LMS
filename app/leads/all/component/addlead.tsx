"use client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Lead {
  name: string;
  email: string;
  phone: string;
  gender: string;
  company: string;
  status: string;
  lead_source: string;
  assignedTo: string;
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

export default function AddLeadModal({ isOpen, onClose }: ModalComponentProps) {
  const [lead, setLead] = useState<Partial<Lead>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isdisabled, setIsdisabled] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [productOptions, setProductOptions] = useState<productOptions[]>([]);
  const { toast } = useToast();
  const fetchuser = async () => {
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
    } catch (error) {
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

  useEffect(() => {
    fetchuser();
    fetchProducts();
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

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

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
      const responce = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/`,
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
      toast("Lead has been added successfully", "Success", {
        title: "Lead Added Successfully",
        description: "Lead has been added successfully.",
        duration: 4000,
      });
    } catch (error: any) {
      console.error(
        "Error registering sales representative:",
        error.response.data.message
      );
      if (error.response.data.message === "Lead already exists") {
        toast("Lead already exists", "Error", {
          title: "Lead Already Exists",
          description: "Lead already exists.",
          duration: 4000,
        });
      } else {
        toast("Error adding lead", "Error", {
          title: "Error adding lead",
          description: "Error adding lead.",
          duration: 4000,
        });
      }
    } finally {
      setIsdisabled(false);
    }
  };

  const role = Cookies.get("role");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Lead
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                value={lead.name || ""}
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
                value={lead.email || ""}
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
                value={lead.phone || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                required
                value={lead.company || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Lead Source */}
          <div className="space-y-2">
            <Label htmlFor="lead_source">Lead Source</Label>
            <Input
              id="lead_source"
              name="lead_source"
              required
              value={lead.lead_source || ""}
              onChange={handleChange}
            />
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
            {role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("assignedTo", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select onValueChange={(value) => handleGenderChange(value)}>
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
              value={lead.description || ""}
              onChange={handleChange}
              className="w-full min-h-[100px] max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all"
              style={{
                resize: "vertical",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
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
              {isdisabled ? "Adding" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
