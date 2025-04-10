
// Utility functions for Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Flag to track API connection status
let isSupabaseAvailable = true;

// Simple response type without nested generics
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Direct utility functions for database operations that don't cause type recursion
export const executeQuery = async <T = any>(
  client: any,
  table: string,
  query: string = '*'
): Promise<SupabaseResponse<T[]>> => {
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

export const executeInsert = async <T = any>(
  client: any,
  table: string,
  data: Record<string, any>
): Promise<SupabaseResponse<T>> => {
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

export const executeUpdate = async <T = any>(
  client: any,
  table: string,
  data: Record<string, any>,
  column: string,
  value: any
): Promise<SupabaseResponse<T>> => {
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
