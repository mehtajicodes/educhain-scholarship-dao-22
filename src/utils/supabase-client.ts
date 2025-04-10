
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Define a simple response type to avoid recursive type issues
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Direct query function with simplified return type
export const executeQuery = async <T>(
  client: any,
  table: string,
  query: string = '*'
): Promise<SupabaseResponse<T[]>> => {
  try {
    const result = await client.from(table).select(query);
    return {
      data: result.data as T[] | null,
      error: result.error
    };
  } catch (error) {
    console.error(`Error executing query on ${table}:`, error);
    return { data: null, error };
  }
};

// Execute an insert operation with simplified return type
export const executeInsert = async <T>(
  client: any,
  table: string,
  data: Record<string, any>
): Promise<SupabaseResponse<T>> => {
  try {
    const result = await client.from(table).insert(data);
    return {
      data: result.data as T | null,
      error: result.error
    };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { data: null, error };
  }
};

// Execute an update operation with simplified return type
export const executeUpdate = async <T>(
  client: any,
  table: string,
  data: Record<string, any>,
  column: string,
  value: any
): Promise<SupabaseResponse<T>> => {
  try {
    const result = await client.from(table).update(data).eq(column, value);
    return {
      data: result.data as T | null,
      error: result.error
    };
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    return { data: null, error };
  }
};
