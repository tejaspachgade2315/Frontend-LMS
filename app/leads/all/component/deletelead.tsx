import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/token";
import axios from "axios";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  leadid: string | undefined;
  leadname: string | undefined;
}

export default function Deletelead({
  isOpen,
  onClose,
  leadname,
  leadid,
}: ModalComponentProps) {
  const confirmDelete = async () => {
    const token = getToken("authToken");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/${leadid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {leadname}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
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
