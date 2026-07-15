export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      books: {
        Row: {
          added_by: string | null;
          author: string | null;
          cover_url: string | null;
          created_at: string;
          genre: string | null;
          id: string;
          isbn: string | null;
          published_year: number | null;
          publisher: string | null;
          reading_status: string | null;
          status: string;
          synopsis: string | null;
          tags: string[];
          title: string;
          updated_at: string;
          wishlist_note: string | null;
        };
        Insert: {
          added_by?: string | null;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          genre?: string | null;
          id?: string;
          isbn?: string | null;
          published_year?: number | null;
          publisher?: string | null;
          reading_status?: string | null;
          status?: string;
          synopsis?: string | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          wishlist_note?: string | null;
        };
        Update: {
          added_by?: string | null;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          genre?: string | null;
          id?: string;
          isbn?: string | null;
          published_year?: number | null;
          publisher?: string | null;
          reading_status?: string | null;
          status?: string;
          synopsis?: string | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          wishlist_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "books_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          book_id: string;
          borrower_name: string;
          created_by: string | null;
          id: string;
          loaned_at: string;
          notes: string | null;
          returned_at: string | null;
        };
        Insert: {
          book_id: string;
          borrower_name: string;
          created_by?: string | null;
          id?: string;
          loaned_at?: string;
          notes?: string | null;
          returned_at?: string | null;
        };
        Update: {
          book_id?: string;
          borrower_name?: string;
          created_by?: string | null;
          id?: string;
          loaned_at?: string;
          notes?: string | null;
          returned_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_color: string;
          created_at: string;
          display_name: string;
          id: string;
        };
        Insert: {
          avatar_color?: string;
          created_at?: string;
          display_name: string;
          id: string;
        };
        Update: {
          avatar_color?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          added_by: string | null;
          book_id: string;
          created_at: string;
          id: string;
          page_number: number | null;
          quote_text: string;
          updated_at: string;
        };
        Insert: {
          added_by?: string | null;
          book_id: string;
          created_at?: string;
          id?: string;
          page_number?: number | null;
          quote_text: string;
          updated_at?: string;
        };
        Update: {
          added_by?: string | null;
          book_id?: string;
          created_at?: string;
          id?: string;
          page_number?: number | null;
          quote_text?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          book_id: string;
          created_at: string;
          id: string;
          rating: number | null;
          review_text: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          book_id: string;
          created_at?: string;
          id?: string;
          rating?: number | null;
          review_text?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          book_id?: string;
          created_at?: string;
          id?: string;
          rating?: number | null;
          review_text?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database["public"];

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"];
