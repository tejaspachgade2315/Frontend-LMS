"use client";
import React, { useState } from "react";
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
import axios from "axios";
import { getToken } from "@/lib/token";
import { useToast } from "@/hooks/use-toast";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onadded: () => void;
}

interface SalesRep {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  sales: number;
  profilePic: File;
}

export default function AddSalesRepModal({
  isOpen,
  onClose,
  onadded
}: ModalComponentProps) {
  const [salesRep, setSalesRep] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isdisabled, setIsdisabled] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalesRep({ ...salesRep, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (value: string) => {
    setSalesRep({ ...salesRep, gender: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImage(file);
    }
  };

  // toast
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken("authToken");
    setIsdisabled(true);
    const formdata = new FormData();
    // Append form data fields
    formdata.append("name", salesRep.name);
    formdata.append("email", salesRep.email);
    formdata.append("phone", salesRep.phone);
    formdata.append("gender", salesRep.gender);
    formdata.append("address", salesRep.address);
    formdata.append("role", "salerep");
    if (image) {
      formdata.append("profilePic", image); // Assuming profilePic is a File object
    }

    try {
      const responce = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/register/`,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Important for FormData
          },
        }
      );
      setIsdisabled(false);
      setSalesRep({
        name: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
      });
      setImage(null);
      onadded();
      setImagePreview(null);
      toast("Sales Representative added Succesfully", "Success", {
        title: "Sales Representative add",
        description: "Sales Representative added Succesfully.",
        duration: 2000,
      });
      onClose();
    } catch (error : any) {
      console.error("Error registering sales representative:", error);
      toast("Sales Representative not added Succesfully", "Error", {
        title: "Server Error",
        description: error.response.data.message,
        duration: 2000,
      });
    } finally {
      setIsdisabled(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Sales Representative
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={salesRep.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={salesRep.email}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={salesRep.phone}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={salesRep.address}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select onValueChange={handleGenderChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label htmlFor="profilePic">Profile Picture</Label>
            <Input
              id="profilePic"
              name="profilePic"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
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
              disabled={isdisabled}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2" disabled={isdisabled}>
              {isdisabled ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
