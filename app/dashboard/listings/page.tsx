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
import { ListingActions } from '@/components/dashboard/listing-actions';

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'banned':
        return 'destructive';
      case 'expired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                      <Badge className={getStatusColor(listing.status)} variant={getStatusVariant(listing.status)}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(listing.price, listing.priceType)}</TableCell>
                    <TableCell className="text-right">
                      <ListingActions listing={listing} />
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