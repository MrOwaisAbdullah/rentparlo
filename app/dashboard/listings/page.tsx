import { createClient } from '@/utils/supabase/server';
import { getListingsBySeller } from '@/lib/sanity-queries';
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

export default async function ListingsPage() {
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect('/auth/login');
  // }

  // const listings: Listing[] = await getListingsBySeller(user.id);

  const mockListings: Listing[] = [
    {
      _id: '1',
      _type: 'listing',
      _createdAt: new Date().toISOString(),
      title: 'My Awesome Camera',
      slug: { current: 'my-awesome-camera' },
      description: 'A great camera for all your needs.',
      priceType: 'daily',
      createdAt: new Date().toISOString(),
      price: 5000,
      category: { _id: 'cat1', title: 'Electronics', slug: 'electronics' },
      images: [{ asset: { url: 'https://placehold.co/400' } }],
      location: { city: 'Karachi', area: 'Clifton' },
      condition: 'like-new',
      availability: { isAvailable: true },
      specifications: [],
      rentalRules: [],
      status: 'active',
      supabaseId: 'user-123',
      created_at: new Date().toISOString(),
    },
    {
      _id: '2',
      _type: 'listing',
      _createdAt: new Date().toISOString(),
      title: 'Professional Drone for Rent with a Very Long Title to Test Overflow',
      slug: { current: 'professional-drone-for-rent' },
      description: 'High-end drone for professional videography.',
      priceType: 'daily',
      createdAt: new Date().toISOString(),
      price: 10000,
      category: { _id: 'cat1', title: 'Electronics', slug: 'electronics' },
      images: [{ asset: { url: 'https://placehold.co/400' } }],
      location: { city: 'Lahore', area: 'Gulberg' },
      condition: 'good',
      availability: { isAvailable: false },
      specifications: [],
      rentalRules: [],
      status: 'pending',
      supabaseId: 'user-123',
      created_at: new Date().toISOString(),
    },
  ];

  const listings: Listing[] = mockListings;

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
          <Link href="/dashboard/listings/create">Create New Listing</Link>
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
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/listings/edit/${listing.slug.current}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    You haven't created any listings yet.
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