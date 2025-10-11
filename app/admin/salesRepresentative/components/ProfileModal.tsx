import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getToken } from "@/lib/token";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
}

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  userId,
}: ModalComponentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = getToken("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl);
    setIsImageZoomed(true);
  };

  const handleZoomedImageClose = () => {
    setIsImageZoomed(false);
    setZoomedImageUrl(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg w-full mx-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              User Profile
            </DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px] md:w-[200px]" />
                  <Skeleton className="h-4 w-[100px] md:w-[150px]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[60px] md:w-[80px]" />
                    <Skeleton className="h-4 w-[100px] md:w-[120px]" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4 md:py-8">
              <p className="text-red-500 mb-4">Failed to load user profile</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : user ? (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <Avatar className="h-16 w-16 md:h-24 md:w-24">
                  <AvatarImage
                    src={user.profilePic}
                    alt={user.name}
                    onClick={() =>
                      handleImageClick(
                        user?.profilePic || "https://github.com/shadcn.png"
                      )
                    }
                  />
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">
                    {user.name}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base capitalize">
                  {user.role =="salerep" ? "Sales Representative" : "Admin"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    {user.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Gender
                  </p>
                  <p className="text-sm md:text-base font-medium capitalize">
                    {user.gender}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Role
                  </p>
                  <p className="text-sm md:text-base font-medium capitalize">
                    {user.role =="salerep" ? "Sales Representative" : "Admin"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Address
                </p>
                <p className="text-sm md:text-base font-medium">
                  {user.address}
                </p>
              </div>

              {/* <div className="flex justify-end pt-3 md:pt-4">
                <Button onClick={onClose} className="text-sm md:text-base">
                  Close
                </Button>
              </div> */}
            </div>
          ) : (
            <div className="text-center py-4 md:py-8">
              <p className="text-sm md:text-base">No user data available</p>
            </div>
          )}
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
