import { createClient } from '@/utils/supabase/server';
import { searchListings } from '@/lib/sanity-queries';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Listing } from '@/types';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteListing } from '@/lib/data-integration';

export default async function ListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch listings for the current seller
  const listings: Listing[] = await searchListings({
    sellerId: user.id
  });

  const formatPrice = (price: number, priceType: string) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const typeMap: { [key: string]: string } = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
    };

    return `${formatted}${typeMap[priceType] || ''}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button asChild>
          <Link href="/dashboard/create-listing">Create New Listing</Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell>
                      <Image
                        src={listing.images?.[0]?.asset?.url || 'https://placehold.co/400'}
                        alt={listing.title}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(listing.price, listing.priceType)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/listing/${listing.slug?.current}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/listings/edit/${listing._id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this listing?')) {
                                try {
                                  const response = await fetch(`/api/listings?id=${listing._id}`, {
                                    method: 'DELETE',
                                  });
                                  
                                  if (response.ok) {
                                    // Refresh the page to show updated listings
                                    window.location.reload();
                                  } else {
                                    const error = await response.json();
                                    alert(error.error || 'Failed to delete listing');
                                  }
                                } catch (error) {
                                  console.error('Error deleting listing:', error);
                                  alert('Failed to delete listing');
                                }
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    You haven't created any listings yet.{' '}
                    <Link href="/dashboard/create-listing" className="text-blue-600 hover:underline">
                      Create your first listing
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}