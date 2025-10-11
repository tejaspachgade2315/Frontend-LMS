import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import axios, { AxiosError } from "axios";
import { getToken, removeToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

type PasswordField = "current" | "new" | "confirm";
type PasswordFieldKey = `${PasswordField}Password`;

export default function ChangePassword({
  isOpen,
  onClose,
}: ChangePasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const [isdisabled, setIsdisabled] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field: PasswordField) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: any) => {
    const token = getToken("authToken");
    if (!token) {
      toast("Authentication token not found","Error",{
        title: "Error",
        description: "Authentication token not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsdisabled(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/changepassword`,
        {
          oldPassword: data.currentPassword,
          newPassword: data.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast("Password changed successfully","Success",{
        title: "Success",
        description: "Password changed successfully",
        variant: "default",
      });

      removeToken("authToken");
      reset();
      onClose();
      router.push("/login");
    } catch (error) {
      let errorMessage = "Failed to change password";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorMessage =
            error.response.data.message || "Old password is incorrect";
        } else if (error.response?.status === 404) {
          errorMessage = "User not found";
        } else {
          errorMessage =
            error.response?.data?.message || "Server error occurred";
        }
      }

      toast(`${errorMessage}`,"Error",{
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        className: "text-white",
      });
    } finally {
      setIsdisabled(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(["current", "new", "confirm"] as PasswordField[]).map((field) => {
            const fieldKey: PasswordFieldKey = `${field}Password`;
            return (
              <div key={field} className="relative">
                <Label htmlFor={fieldKey} className="mb-2">
                  {field === "current"
                    ? "Current Password"
                    : field === "new"
                    ? "New Password"
                    : "Confirm New Password"}
                </Label>
                <div className="relative">
                  <Input
                    id={fieldKey}
                    type={showPassword[field] ? "text" : "password"}
                    {...register(fieldKey)}
                    placeholder={
                      field === "current"
                        ? "Enter current password"
                        : field === "new"
                        ? "Enter new password"
                        : "Confirm new password"
                    }
                    disabled={isdisabled}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500"
                    onClick={() => toggleVisibility(field)}
                    disabled={isdisabled}
                  >
                    {showPassword[field] ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors[fieldKey]?.message && (
                  <p className="text-red-500 text-sm">
                    {String(errors[fieldKey]?.message)}
                  </p>
                )}
              </div>
            );
          })}
          <DialogFooter>
            <Button type="submit" disabled={isdisabled}>
              {isdisabled ? "Processing..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
