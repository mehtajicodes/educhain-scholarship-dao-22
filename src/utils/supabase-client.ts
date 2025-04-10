
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Simplified response type without recursion
export interface SimpleResponse<T> {
  data: T | null;
  error: any;
}

// Direct query function with simplified return type
export const executeQuery = async <T>(
  client: any,
  table: string,
  query: string = '*'
): Promise<SimpleResponse<T[]>> => {
  try {
    const response = await client.from(table).select(query);
    return { 
      data: response.data as T[] | null, 
      error: response.error 
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
): Promise<SimpleResponse<T>> => {
  try {
    const response = await client.from(table).insert(data).select();
    return { 
      data: response.data?.[0] as T | null, 
      error: response.error 
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
): Promise<SimpleResponse<T>> => {
  try {
    const response = await client.from(table).update(data).eq(column, value).select();
    return { 
      data: response.data?.[0] as T | null, 
      error: response.error 
    };
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    return { data: null, error };
  }
};
