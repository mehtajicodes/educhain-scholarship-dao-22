export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_address: string
          created_at: string
          id: string
          scholarship_id: string
          status: string
        }
        Insert: {
          applicant_address: string
          created_at?: string
          id?: string
          scholarship_id: string
          status?: string
        }
        Update: {
          applicant_address?: string
          created_at?: string
          id?: string
          scholarship_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      code_purchases: {
        Row: {
          buyer_address: string
          created_at: string
          id: string
          listing_id: string
          price: string
          seller_address: string
          transaction_hash: string
        }
        Insert: {
          buyer_address: string
          created_at?: string
          id?: string
          listing_id: string
          price: string
          seller_address: string
          transaction_hash: string
        }
        Update: {
          buyer_address?: string
          created_at?: string
          id?: string
          listing_id?: string
          price?: string
          seller_address?: string
          transaction_hash?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          amount: number
          created_at: string
          creator_address: string
          deadline: string
          description: string
          id: string
          status: string
          title: string
          votes_against: number
          votes_for: number
        }
        Insert: {
          amount: number
          created_at?: string
          creator_address: string
          deadline: string
          description: string
          id?: string
          status?: string
          title: string
          votes_against?: number
          votes_for?: number
        }
        Update: {
          amount?: number
          created_at?: string
          creator_address?: string
          deadline?: string
          description?: string
          id?: string
          status?: string
          title?: string
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          financier_address: string
          id: string
          recipient_address: string
          scholarship_id: string
          status: string
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          financier_address: string
          id?: string
          recipient_address: string
          scholarship_id: string
          status?: string
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          financier_address?: string
          id?: string
          recipient_address?: string
          scholarship_id?: string
          status?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          scholarship_id: string
          vote_type: boolean
          voter_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          scholarship_id: string
          vote_type: boolean
          voter_address: string
        }
        Update: {
          created_at?: string
          id?: string
          scholarship_id?: string
          vote_type?: boolean
          voter_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
