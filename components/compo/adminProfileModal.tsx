"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { getToken } from "@/lib/token";
import { ClipLoader } from "react-spinners";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminProfileModal({
  isOpen,
  onClose,
}: AdminProfileModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
  };

  const fetchuserData = async () => {
    const token = getToken("authToken");
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data.user);
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchuserData();
  }, []);

  const handleImageClick = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl);
    setIsImageZoomed(true);
  };

  const handleZoomedImageClose = () => {
    setIsImageZoomed(false);
    setZoomedImageUrl(null);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="flex justify-center items-center w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg">
          <DialogTitle className="sr-only">User Profile Details</DialogTitle>
          <ClipLoader color="#4B7BEC" size={50} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg cursor-pointer">
          <DialogTitle className="sr-only">User Profile Details</DialogTitle>
          <div className="flex flex-col items-center space-y-4">
            <img
              src={userData?.profilePic || "https://github.com/shadcn.png"}
              alt=" "
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 cursor-pointer"
              onClick={() =>
                handleImageClick(
                  userData?.profilePic || "https://github.com/shadcn.png"
                )
              }
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {userData?.name || "N/A"}
              </h2>
              <p className="text-gray-500">{userData?.role || "N/A"}</p>
              <p className="text-sm text-gray-400">
                {userData?.email || "N/A"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">
                  Contact Info
                </h3>
                <p>
                  <strong>Phone:</strong> {userData?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {userData?.address || "N/A"}
                </p>
                <p>
                  <strong>Gender:</strong> {userData?.gender || "N/A"}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">
                  Account Info
                </h3>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(userData?.createdAt).toLocaleDateString() || "N/A"}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(userData?.updatedAt).toLocaleDateString() || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isImageZoomed && (
        <Dialog open={isImageZoomed} onOpenChange={handleZoomedImageClose}>
          <DialogContent className="flex justify-center items-center w-full max-w-3xl p-4 rounded-lg bg-white shadow-lg">
            {/* Add DialogTitle for accessibility */}
            <DialogTitle className="sr-only">Zoomed Profile Image</DialogTitle>
            {zoomedImageUrl && (
              <img
                src={zoomedImageUrl}
                alt="Zoomed User Profile"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
