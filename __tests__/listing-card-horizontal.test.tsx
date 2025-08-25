import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListingCardHorizontal } from '../components/cards/listing-card-horizontal';
import { Listing } from '../types';

// Mock next/image component
jest.mock('next/image', () => {
  return ({ alt, ...props }: any) => <img alt={alt} {...props} />;
});

// Mock next/link component
jest.mock('next/link', () => {
  return ({ children, ...props }: any) => <a {...props}>{children}</a>;
});

describe('ListingCardHorizontal', () => {
  const mockListing: Listing = {
    _id: 'test-id',
    _type: 'listing',
    title: 'Test Listing',
    slug: { current: 'test-listing' },
    description: 'This is a test listing',
    price: 1000,
    priceType: 'daily',
    category: {
      _ref: 'category-id',
      title: 'Test Category'
    },
    images: [
      {
        asset: {
          url: '/test-image.jpg',
          metadata: {}
        }
      }
    ],
    location: {
      city: 'Karachi',
      area: 'Clifton'
    },
    condition: 'like-new',
    availability: {
      isAvailable: true
    },
    specifications: [],
    rentalRules: [],
    status: 'active',
    supabaseId: 'user-id',
    isFeatured: false,
    featuredPriority: 0,
    _createdAt: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    views: 100,
    contactClicks: 50,
    badges: ['Featured']
  };

  it('should render listing information correctly', () => {
    render(<ListingCardHorizontal listing={mockListing} />);
    
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('This is a test listing')).toBeInTheDocument();
    expect(screen.getByText('PKR 1,000')).toBeInTheDocument();
    expect(screen.getByText('Clifton, Karachi')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should not render when listing is null', () => {
    const { container } = render(<ListingCardHorizontal listing={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display price type correctly', () => {
    render(<ListingCardHorizontal listing={mockListing} />);
    
    expect(screen.getByText('/day')).toBeInTheDocument();
  });
});