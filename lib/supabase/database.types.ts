export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProductCategory = "audio" | "wearables" | "lighting" | "power";
type OrderStatus = "processing" | "paid" | "fulfilled" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "shipped";
type UserRole = "customer" | "admin";
type DeliveryMethod = "standard" | "express" | "overnight";

type Fk<Name extends string, Column extends string, Relation extends string> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Relation;
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          name: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          zip: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          name: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          zip: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      inventory_logs: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          change: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          change: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_logs"]["Insert"]>;
        Relationships: [Fk<"inventory_logs_product_id_fkey", "product_id", "products">];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          label: string;
          occurred_at: string | null;
          complete: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          label: string;
          occurred_at?: string | null;
          complete?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_events"]["Insert"]>;
        Relationships: [Fk<"order_events_order_id_fkey", "order_id", "orders">];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          slug: string;
          name: string;
          image: string;
          variant: string;
          price: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          slug: string;
          name: string;
          image: string;
          variant: string;
          price: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          Fk<"order_items_order_id_fkey", "order_id", "orders">,
          Fk<"order_items_product_id_fkey", "product_id", "products">,
        ];
      };
      orders: {
        Row: {
          id: string;
          number: string;
          user_id: string;
          placed_at: string;
          payment_status: PaymentStatus;
          fulfillment_status: FulfillmentStatus;
          status: OrderStatus;
          shipping_address: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          delivery: DeliveryMethod;
        };
        Insert: {
          id?: string;
          number: string;
          user_id: string;
          placed_at?: string;
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          status?: OrderStatus;
          shipping_address: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          delivery?: DeliveryMethod;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [Fk<"orders_user_id_fkey", "user_id", "profiles">];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku_key: string;
          name: string;
        };
        Insert: {
          id: string;
          product_id: string;
          sku_key: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [Fk<"product_variants_product_id_fkey", "product_id", "products">];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          description: string;
          price: number;
          compare_at_price: number | null;
          rating: number;
          review_count: number;
          category: ProductCategory;
          images: string[];
          stock: number;
          featured: boolean;
          best_seller: boolean;
          newest: boolean;
          on_sale: boolean;
          archived_at: string | null;
          specs: Json;
          shipping: string;
          returns: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          tagline?: string;
          description?: string;
          price: number;
          compare_at_price?: number | null;
          rating?: number;
          review_count?: number;
          category: ProductCategory;
          images?: string[];
          stock?: number;
          featured?: boolean;
          best_seller?: boolean;
          newest?: boolean;
          on_sale?: boolean;
          archived_at?: string | null;
          specs?: Json;
          shipping?: string;
          returns?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          email: string;
          phone?: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          author: string;
          rating: number;
          title: string;
          body: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          author: string;
          rating: number;
          title: string;
          body: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [Fk<"reviews_product_id_fkey", "product_id", "products">];
      };
      wishlist_items: {
        Row: {
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>;
        Relationships: [Fk<"wishlist_items_product_id_fkey", "product_id", "products">];
      };
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          origin: string;
          support_email: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          origin?: string;
          support_email?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["store_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      place_order: {
        Args: {
          p_items: Json;
          p_shipping_address: Json;
          p_delivery: DeliveryMethod;
        };
        Returns: string;
      };
    };
    Enums: {
      delivery_method: DeliveryMethod;
      fulfillment_status: FulfillmentStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      product_category: ProductCategory;
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
