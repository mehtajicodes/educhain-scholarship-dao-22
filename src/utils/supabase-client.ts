
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Safe Supabase API call handling
export const safeSupabaseCall = async <T>(
  apiCall: () => Promise<{data: T | null, error: any}>, 
  fallbackData: T | null = null
): Promise<{data: T | null, error: any}> => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("Supabase API call failed:", error);
    return { data: fallbackData, error };
  }
};

// Simplified query function to avoid type recursion
export const executeQuery = async (
  client: any,
  table: string,
  query: string = '*'
): Promise<{ data: any[] | null; error: any }> => {
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

// Execute an insert operation with simpler typing
export const executeInsert = async (
  client: any,
  table: string,
  data: Record<string, any>
): Promise<{ data: any | null; error: any }> => {
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

// Execute an update operation with simpler typing
export const executeUpdate = async (
  client: any,
  table: string,
  data: Record<string, any>,
  column: string,
  value: any
): Promise<{ data: any | null; error: any }> => {
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
