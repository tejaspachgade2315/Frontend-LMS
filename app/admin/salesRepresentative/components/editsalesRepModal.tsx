import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null | undefined;
  onRefresh : () => void
}

export default function EditsalesRepModal({
  isOpen,
  onClose,
  editId,
  onRefresh
}: ModalComponentProps) {
   // toast
   const { toast } = useToast();
  const [salesRep, setSalesRep] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalesRep({ ...salesRep, [e.target.name]: e.target.value });
  };

  // Handle gender change
  const handleGenderChange = (value: string) => {
    setSalesRep({ ...salesRep, gender: value });
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImage(file);
    }
  };

  // Fetch sales rep data
  const fetchEditData = async () => {
    if (!editId) return;
    setIsLoading(true);
    const token = getToken("authToken");
    try {
      const response = await axios.get<any, any>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${editId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSalesRep({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
        phone: response.data.user.phone || "",
        address: response.data.user.address || "",
        gender: response.data.user.gender || "",
      });

      // If there's an existing profile picture, set the preview
      if (response.data.user.profilePic) {
        setImagePreview(response.data.user.profilePic);
      }
    } catch (error) {
      console.error("Error fetching sales rep data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEditData();
    }
  }, [editId, isOpen]); // Dependency array ensures fetching when editId changes

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken("authToken");
    setIsDisabled(true);
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
    } else {
      if (imagePreview) formdata.append("profilePic", imagePreview);
    }

    try {
      const responce = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/` + editId,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Important for FormData
          },
        }
      );
      toast("Sales Representative edit Succesfully", "Success", {
        title: "Sales Representative edit",
        description: "Sales Representative edited Succesfully.",
        duration: 2000,
      });
      setIsDisabled(false);
      setSalesRep({
        name: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
      });
      onRefresh();
      setImage(null);
      setImagePreview(null);
      onClose();
    } catch (error  :any) {
      console.error("Error registering sales representative:", error);
      toast("Sales Representative not edited Succesfully", "Error", {
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
      <DialogContent className="max-h-[90%] max-w-lg  overflow-auto mx-auto p-6 max-md:max-h-[100%]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Sales Representative
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleEdit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                className="w-full"
                value={salesRep.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="w-full"
                value={salesRep.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full"
                value={salesRep.phone}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                required
                className="w-full"
                value={salesRep.address}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                onValueChange={handleGenderChange}
                value={salesRep.gender}
              >
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
                disabled={isDisabled}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button type="submit" className="px-4 py-2" disabled={isDisabled}>
                Edit
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
