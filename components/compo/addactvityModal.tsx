import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";

const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "follow-up", "other"], {
    message: "Select a valid activity type",
  }),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "completed", "canceled", "scheduled"], {
    message: "Select a valid status",
  }),
});
interface Activity {
  _id: string;
  type: "call" | "email" | "meeting" | "follow-up" | "other";
  subject: string;
  description: string;
  status: "pending" | "completed" | "canceled" | "scheduled";
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  leadid: string | null | undefined;
  prefilledData?: {
    type: Activity["type"];
    subject: string;
  };
  onAddActivity : () => void;
}

export default function AddActivityModal({
  isOpen,
  onClose,
  leadid,
  prefilledData,
  onAddActivity,
}: ModalComponentProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: prefilledData?.type || "call",
      subject: prefilledData?.subject || "",
      description: "",
      status: "pending",
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const onSubmit = async (data: any) => {
    if (!leadid) return;

    try {
      const token = getToken("authToken");
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity`,
        { ...data, leadId: leadid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast("Activity created successfully", "Success", {
        title: "Activity created successfully",
        description: `Activity created successfully`,
        duration: 2000,
      });
      reset();
      onClose();
      router.push("/activities");
      onAddActivity();
    } catch (error: any) {
      console.error("Error creating activity:", error);
      toast("Error creating activity", "Error", {
        title: "Error creating activity",
        description: `Error creating activity`,
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (isOpen && prefilledData) {
      setValue("type", prefilledData.type);
      setValue("subject", prefilledData.subject);
    }
  }, [prefilledData, setValue, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset(); // Reset form when modal is closed
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90%] max-w-lg overflow-auto mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Activity
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Activity Type Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Activity Type</label>
            <Select
              onValueChange={(value: any) => setValue("type", value)}
              defaultValue={prefilledData?.type || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="follow-up">Follow-Up</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <Input placeholder="Subject" {...register("subject")} />
            {errors.subject && (
              <p className="text-red-500 text-sm">{errors.subject.message}</p>
            )}
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              placeholder="Description"
              className="w-full min-h-[100px] max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all"
              {...register("description")}
            />
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <Select onValueChange={(value: any) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
