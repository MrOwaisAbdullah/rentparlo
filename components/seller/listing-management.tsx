'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Eye, 
  Phone, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ExternalLink,
  Copy,
  Archive,
  Star,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Listing {
  _id: string;
  title: string;
  price: number;
  priceType: string;
  status: string;
  availability: string;
  images: string[];
  views: number;
  contactClicks: number;
  createdAt: string;
  updatedAt: string;
}

interface ListingManagementProps {
  listings: Listing[];
  maxListings: number;
}

export function ListingManagement({ listings, maxListings }: ListingManagementProps) {
  const [selectedView, setSelectedView] = React.useState<'grid' | 'table'>('table');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap = {
      hourly: 'hr',
      daily: 'day', 
      weekly: 'week',
      monthly: 'month'
    };

    return `${formatted}/${typeMap[priceType as keyof typeof typeMap] || priceType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string, availability: string) => {
    if (status === 'active' && availability === 'available') {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
    if (status === 'active' && availability === 'rented') {
      return <Badge className="bg-blue-100 text-blue-800">Rented</Badge>;
    }
    if (status === 'draft') {
      return <Badge variant="outline">Draft</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const handleDeleteListing = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        // API call to delete listing
        await fetch(`/api/listings/${listingId}`, {
          method: 'DELETE'
        });
        // Refresh page or update state
        window.location.reload();
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  const handleDuplicateListing = async (listingId: string) => {
    try {
      // API call to duplicate listing
      await fetch(`/api/listings/${listingId}/duplicate`, {
        method: 'POST'
      });
      // Refresh page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error duplicating listing:', error);
      alert('Failed to duplicate listing. Please try again.');
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Failed to update listing status. Please try again.');
    }
  };

  const filteredListings = listings.filter(listing => {
    if (selectedStatus === 'all') return true;
    return listing.status === selectedStatus;
  });

  const activeListings = listings.filter(l => l.status === 'active').length;
  const usagePercentage = (activeListings / maxListings) * 100;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Listing Management</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{activeListings} of {maxListings} slots used</span>
            <div className="flex items-center gap-2">
              <Progress value={usagePercentage} className="w-20 h-2" />
              <span>{usagePercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Filter: {selectedStatus}
          </Button>
          <Link href="/dashboard/create-listing">
            <Button size="sm" disabled={activeListings >= maxListings}>
              Add New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">
                  {listings.reduce((sum, l) => sum + (l.contactClicks || 0), 0)}
                </p>
              </div>
              <Phone className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">
                  PKR {Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{activeListings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No listings found.</div>
              <Link href="/dashboard/create-listing">
                <Button>Create Your First Listing</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={listing.images[0] || '/images/placeholder-item.jpg'}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="font-medium line-clamp-1">{listing.title}</div>
                          <div className="text-sm text-muted-foreground">ID: {listing._id.slice(-8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(listing.price, listing.priceType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(listing.status, listing.availability)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        {listing.views || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {listing.contactClicks || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(listing.updatedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/listing/${listing._id}`} className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/listings/${listing._id}/edit`} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Edit Listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicateListing(listing._id)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(listing._id, listing.status)}
                            className="flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteListing(listing._id)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ListingManagement;