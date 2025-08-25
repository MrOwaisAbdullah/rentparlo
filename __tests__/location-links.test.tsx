import React from 'react';
import { render, screen } from '@testing-library/react';
import LocationLinks from '../components/sections/location-links';
import { CATEGORY_LOCATION_LINKS } from '../lib/location-links-data';

// Mock the window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('LocationLinks', () => {
  it('should render category titles correctly', () => {
    render(<LocationLinks />);
    
    // Check that each category title is rendered
    CATEGORY_LOCATION_LINKS.forEach(category => {
      expect(screen.getByText(category.category)).toBeInTheDocument();
    });
  });

  it('should render link labels and descriptions', () => {
    render(<LocationLinks />);
    
    // Check first link in each category
    CATEGORY_LOCATION_LINKS.forEach(category => {
      const firstLink = category.links[0];
      expect(screen.getByText(firstLink.label)).toBeInTheDocument();
      expect(screen.getByText(firstLink.description)).toBeInTheDocument();
    });
  });

  it('should have correct number of categories', () => {
    render(<LocationLinks />);
    
    const categoryTitles = screen.getAllByText(/^[A-Za-z].*[a-z]$/); // Match category titles
    expect(categoryTitles.length).toBeGreaterThanOrEqual(CATEGORY_LOCATION_LINKS.length);
  });

  it('should have correct number of links per category', () => {
    render(<LocationLinks />);
    
    // Check that each category has the correct number of links
    CATEGORY_LOCATION_LINKS.forEach(category => {
      const categorySection = screen.getByText(category.category).closest('div');
      if (categorySection) {
        const links = categorySection.querySelectorAll('div[role="button"]');
        expect(links.length).toBeGreaterThanOrEqual(category.links.length);
      }
    });
  });
});