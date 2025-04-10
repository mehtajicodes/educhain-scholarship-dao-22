
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Create a simple, direct response type without nested generics
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Direct utility function for API calls - no chaining that could cause type recursion
export const safeSupabaseCall = async <T>(
  apiCall: () => Promise<{ data: T | null; error: any }>, 
  fallbackData: T | null = null
): Promise<SupabaseResponse<T>> => {
  try {
    const result = await apiCall();
    return { 
      data: result.data,
      error: result.error 
    };
  } catch (error) {
    console.error("Supabase API call failed:", error);
    return { data: fallbackData, error };
  }
};

// Utility function for direct query execution
export const executeQuery = async <T = any>(
  client: any,
  table: string,
  query: string = '*'
): Promise<{ data: T[] | null; error: any }> => {
  try {
    const response = await client.from(table).select(query);
    return {
      data: response.data,
      error: response.error
    };
  } catch (error) {
    console.error(`Error executing query on ${table}:`, error);
    return { data: null, error };
  }
};

// Utility function for direct insert operation
export const executeInsert = async <T = any>(
  client: any,
  table: string,
  data: Record<string, any>
): Promise<{ data: T | null; error: any }> => {
  try {
    const response = await client.from(table).insert(data);
    return {
      data: response.data,
      error: response.error
    };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { data: null, error };
  }
};

// Utility function for direct update operation
export const executeUpdate = async <T = any>(
  client: any,
  table: string,
  data: Record<string, any>,
  column: string,
  value: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const response = await client.from(table).update(data).eq(column, value);
    return {
      data: response.data,
      error: response.error
    };
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    return { data: null, error };
  }
};
