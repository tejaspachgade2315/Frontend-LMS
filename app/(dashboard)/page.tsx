"use client";
import MenuLayout from "@/components/menulayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Briefcase, Package, Users } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  productImage: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  company: string;
  lead_source: string;
  assignedTo: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  _id: string;
  leadId: {
    _id: string;
    name: string;
  };
  type: string;
  subject: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface SalesRep {
  _id: string;
  name: string;
  leadCount: number;
  wonLeads: number;
}

interface DashboardData {
  summary: {
    totalProducts: number;
    totalLeads: number;
    totalSalesReps: number;
    totalActivities: number;
    totalAssignedLeads: number;
    conversionRate: number;
  };
  products: {
    count: number;
    topStock: Product[];
  };
  leads: {
    count: number;
    recent: Lead[];
    byStatus: Array<{ _id: string; count: number }>;
  };
  activities: {
    recent: Activity[];
  };
  salesTeam: {
    topPerformers: SalesRep[];
  };
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  gender: string;
  address: string;
  profilePic: string;
}
export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken("authToken");
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(userResponse.data.user);

        const dashboardResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(dashboardResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MenuLayout title="Dashboard">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="col-span-4 h-[400px]" />
            <Skeleton className="col-span-3 h-[400px]" />
          </div>
        </div>
      </MenuLayout>
    );
  }

  if (error || !data) {
    return (
      <MenuLayout title="Dashboard">
        <div className="flex-1 flex items-center justify-center p-8 pt-6">
          <div className="text-center">
            <h2 className="text-lg text-red-500 mb-4">
              Failed to load dashboard.
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 bg-black text-white rounded hover:bg-black/80"
            >
              Retry
            </button>
          </div>
        </div>
      </MenuLayout>
    );
  }

  if (!user) {
    return (
      <MenuLayout title="Dashboard">
        <div className="flex-1 flex items-center justify-center p-8 pt-6">
          <div className="text-center">
            <h2 className="text-lg text-red-500 mb-4">
              Failed to load user data.
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 bg-black text-white rounded hover:bg-black/80"
            >
              Retry
            </button>
          </div>
        </div>
      </MenuLayout>
    );
  }

  if (user.role === "admin") {
    return (
      <MenuLayout title="Dashboard">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user.name}
            </h2>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Leads
                    </CardTitle>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg> */}
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalLeads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.leads.byStatus.find((s) => s._id === "won")
                        ?.count || 0}{" "}
                      Won Leads
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sales Team
                    </CardTitle>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg> */}
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalSalesReps}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.salesTeam.topPerformers.length} Active Sales
                      Representative
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recent Activities
                    </CardTitle>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg> */}
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalActivities}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.activities.recent.length} Today
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Products
                    </CardTitle>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg> */}
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalProducts}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="space-y-8">
                      {data.leads.recent.length > 0 ? (
                        data.leads.recent.map((lead) => (
                          <div key={lead._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {lead.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {lead.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lead.phone}
                              </p>
                            </div>
                            <div className="ml-auto font-medium capitalize">
                              {lead.status === "proposalsent"
                                ? "Proposal Sent"
                                : lead.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-[100px] ">
                          <p className="text-sm text-muted-foreground">
                            No recent lead found
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                      {data.salesTeam.topPerformers.reduce(
                        (sum, rep) => sum + rep.wonLeads,
                        0
                      )}
                      leads won this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {data?.salesTeam?.topPerformers.length === 0 ? (
                        <div className="flex items-center justify-center h-[100px]">
                          <div className="text-sm text-muted-foreground">
                            No leads won this month
                          </div>
                        </div>
                      ) : (
                        data.salesTeam.topPerformers.map((rep) => (
                          <div key={rep._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {rep.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {rep.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {rep.leadCount} leads
                              </p>
                            </div>
                            <div className="ml-auto font-medium">
                              {rep.wonLeads} won
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {data.activities.recent.length === 0 ? (
                        <div className="flex items-center justify-center h-[100px]">
                          <div className="text-sm text-muted-foreground">
                            No recent activities
                          </div>
                        </div>
                      ) : (
                        data.activities.recent.map((activity) => (
                          <div key={activity._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {activity.createdBy.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.subject}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.type} with {activity?.leadId?.name}
                              </p>
                            </div>
                            <div className="ml-auto font-medium capitalize">
                              {activity.status}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>High Stock Products</CardTitle>
                    <CardDescription>
                      {data.products.count} products in inventory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {data.products.topStock.length === 0 ? (
                        <div className="flex items-center justify-center h-[100px]">
                          <div className="text-sm text-muted-foreground">
                            No products in inventory
                          </div>
                        </div>
                      ) : (
                        data.products.topStock.map((product) => (
                          <div key={product._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={product.productImage}
                                alt={product.name}
                              />
                              <AvatarFallback>
                                {product.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ₹{product.price}
                              </p>
                            </div>
                            <div className="ml-auto font-medium">
                              {product.stock} in stock
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MenuLayout>
    );
  }

  if (user.role === "salerep") {
    return (
      <MenuLayout title="Dashboard">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user.name}
            </h2>
            {/* <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePic} alt={user.name} />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.role}</span>
          </div> */}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Assigned Leads
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalAssignedLeads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        data.leads.recent.filter(
                          (lead) => lead.status === "won"
                        ).length
                      }{" "}
                      won leads
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Conversion Rate
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.conversionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lead to customer conversion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Available Products
                    </CardTitle>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg> */}
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.summary.totalProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.products.topStock.length} high stock items
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Your Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="space-y-8">
                      {data.leads.recent.length === 0 ? (
                        <div className="flex items-center justify-center h-[100px]">
                          <div className="text-sm text-muted-foreground">
                            No recent lead available
                          </div>
                        </div>
                      ) : (
                        data.leads.recent.map((lead) => (
                          <div key={lead._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {lead.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {lead.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lead.company} • {lead.email}
                              </p>
                            </div>
                            <div className="ml-auto font-medium capitalize">
                              {lead.status}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Your Activities</CardTitle>
                    <CardDescription>
                      {data.activities.recent.length} recent activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.activities.recent.length > 0 ? (
                      <div className="space-y-8">
                        {data.activities.recent.map((activity) => (
                          <div key={activity._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {activity.createdBy?.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.subject}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.type} with {activity.leadId?.name}
                              </p>
                            </div>
                            <div className="ml-auto text-sm text-muted-foreground">
                              {new Date(
                                activity.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activities
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                  <CardDescription>
                    {data.products.topStock.length} high stock products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {data.products.topStock.length === 0 ? (
                      <div className="flex items-center justify-center h-[100px]">
                        <div className="text-sm text-muted-foreground">
                          No product  available
                        </div>
                      </div>
                    ) : (
                      data.products.topStock.map((product) => (
                        <div key={product._id} className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={product.productImage}
                              alt={product.name}
                            />
                            <AvatarFallback>
                              {product.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-auto font-medium">
                            {product.stock} in stock
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MenuLayout>
    );
  }

  return (
    <MenuLayout title="Dashboard">
      <div className="flex-1 flex items-center justify-center p-8 pt-6">
        <div className="text-center">
          <h2 className="text-lg text-red-500 mb-4">
            Failed to load dashboard.
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-black text-white rounded hover:bg-black/80"
          >
            Retry
          </button>
        </div>
      </div>
    </MenuLayout>
  );
}
