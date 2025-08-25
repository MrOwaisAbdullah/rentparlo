import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPakistaniCities } from '../lib/supabase-queries';
import { createClient } from '../utils/supabase/server';

// Mock the Supabase client
vi.mock('../utils/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('Cities Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  it('should fetch Pakistani cities successfully', async () => {
    // Mock the Supabase client response
    const mockCities = [
      { id: '1', name: 'Karachi', province: 'Sindh' },
      { id: '2', name: 'Lahore', province: 'Punjab' },
      { id: '3', name: 'Islamabad', province: 'ICT' }
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockCities,
        error: null
      })
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    const cities = await getPakistaniCities();

    expect(cities).toEqual(mockCities);
    expect(mockSupabase.from).toHaveBeenCalledWith('cities');
    expect(mockSupabase.select).toHaveBeenCalledWith('*');
    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });

  it('should return empty array when there is an error fetching cities', async () => {
    // Mock the Supabase client to return an error
    const mockError = {
      message: 'Database connection failed',
      code: 'DB_ERROR',
      details: 'Connection timeout',
      hint: 'Check database connectivity'
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    // Mock console.error to prevent logging during tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const cities = await getPakistaniCities();

    expect(cities).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching cities:', {
      message: mockError.message,
      code: mockError.code,
      details: mockError.details,
      hint: mockError.hint
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it('should handle empty data response', async () => {
    // Mock the Supabase client to return empty data
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    const cities = await getPakistaniCities();

    expect(cities).toEqual([]);
  });
});