
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Simplified response type to avoid recursion
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
    const { data, error } = await client.from(table).select(query);
    return { data: data as T[] | null, error };
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
    const { data: resultData, error } = await client.from(table).insert(data).select();
    return { data: resultData?.[0] as T | null, error };
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
    const { data: resultData, error } = await client.from(table).update(data).eq(column, value).select();
    return { data: resultData?.[0] as T | null, error };
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    return { data: null, error };
  }
};
