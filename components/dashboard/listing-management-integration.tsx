"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getAllListingsBySeller } from "@/lib/sanity-queries";
import { Listing } from "@/types";
import { ListingActions } from "./listing-actions";

interface ListingManagementIntegrationProps {
  sellerId: string;
  initialListings?: Listing[];
  analytics?: {
    [listingId: string]: {
      views: number;
      contacts: number;
      conversionRate: number;
    };
  };
}

interface ListingWithAnalytics extends Listing {
  analytics?: {
    views: number;
    contacts: number;
    conversionRate: number;
  };
}

export function ListingManagementIntegration({
  sellerId,
  initialListings = [],
  analytics = {},
}: ListingManagementIntegrationProps) {
  const [listings, setListings] = useState<ListingWithAnalytics[]>([]);
  const [filteredListings, setFilteredListings] = useState<
    ListingWithAnalytics[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedListing, setSelectedListing] =
    useState<ListingWithAnalytics | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize listings with analytics data
  useEffect(() => {
    const listingsWithAnalytics = initialListings.map((listing) => ({
      ...listing,
      analytics: analytics[listing._id] || {
        views: 0,
        contacts: 0,
        conversionRate: 0,
      },
    }));
    setListings(listingsWithAnalytics);
    setFilteredListings(listingsWithAnalytics);
  }, [initialListings, analytics]);

  // Filter and sort listings
  useEffect(() => {
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.category?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => listing.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
        );
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "views":
        filtered.sort(
          (a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0)
        );
        break;
      case "performance":
        filtered.sort(
          (a, b) =>
            (b.analytics?.conversionRate || 0) -
            (a.analytics?.conversionRate || 0)
        );
        break;
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, statusFilter, sortBy]);

  const refreshListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/seller-listings?sellerId=${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        const listingsWithAnalytics = data.data.listings.map(
          (listing: Listing) => ({
            ...listing,
            analytics: analytics[listing._id] || {
              views: 0,
              contacts: 0,
              conversionRate: 0,
            },
          })
        );
        setListings(listingsWithAnalytics);
      }
    } catch (error) {
      console.error("Error refreshing listings:", error);
      toast.error("Failed to refresh listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/listings?id=${selectedListing._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setListings((prev) =>
          prev.filter((l) => l._id !== selectedListing._id)
        );
        toast.success("Listing deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedListing(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap: { [key: string]: string } = {
      hourly: "/hr",
      daily: "/day",
      weekly: "/week",
      monthly: "/month",
    };

    return `${formatted}${typeMap[priceType] || ""}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "banned":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "banned":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Listing Management</h2>
          <p className="text-muted-foreground">
            Manage your rental listings and track their performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshListings}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/create-listing">
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-xl font-bold">{listings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">
                  {listings.filter((l) => l.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">
                  {listings.filter((l) => l.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-xl font-bold">
                  {listings.reduce(
                    (sum, l) => sum + (l.analytics?.views || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings ({filteredListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Contact Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>
                        <Image
                          src={
                            listing.images?.[0]?.asset?.url ||
                            "https://placehold.co/400"
                          }
                          alt={listing.title}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">
                            {listing.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {listing.category?.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(listing.status)}
                          variant={getStatusVariant(listing.status)}
                        >
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(listing.price, listing.priceType)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {listing.analytics?.views || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {listing.analytics?.contacts || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {listing.analytics?.conversionRate ? (listing.analytics.views > 0 ? ((listing.analytics.contacts / listing.analytics.views) * 100).toFixed(1) : '0.0') :
                            "0.0"}
                          %
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <ListingActions listing={listing} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      {searchQuery || statusFilter !== "all" ? (
                        <div>
                          <p>No listings match your filters.</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p>You haven't created any listings yet.</p>
                          <Button asChild variant="link">
                            <Link href="/dashboard/create-listing">
                              Create your first listing
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedListing?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedListing(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteListing}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
