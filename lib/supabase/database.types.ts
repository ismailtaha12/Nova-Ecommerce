export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type OrderStatus = "processing" | "paid" | "fulfilled" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "shipped";
type UserRole = "customer" | "admin";
type DeliveryMethod = "standard" | "express" | "overnight";
type CouponType = "percent" | "fixed";
type NotificationChannel = "email" | "sms";

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
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          parent_id: string | null;
          sort_order: number;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          image?: string;
          parent_id?: string | null;
          sort_order?: number;
          archived_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [Fk<"categories_parent_id_fkey", "parent_id", "categories">];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string;
          type: CouponType;
          amount: number;
          min_subtotal: number;
          max_uses: number | null;
          uses: number;
          starts_at: string | null;
          expires_at: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string;
          type: CouponType;
          amount: number;
          min_subtotal?: number;
          max_uses?: number | null;
          uses?: number;
          starts_at?: string | null;
          expires_at?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
        Relationships: [];
      };
      homepage_banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string;
          image: string;
          cta_label: string;
          cta_href: string;
          sort_order: number;
          active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string;
          image?: string;
          cta_label?: string;
          cta_href?: string;
          sort_order?: number;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_banners"]["Insert"]>;
        Relationships: [];
      };
      inventory_logs: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          sku: string;
          change: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          sku: string;
          change: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_logs"]["Insert"]>;
        Relationships: [
          Fk<"inventory_logs_product_id_fkey", "product_id", "products">,
          Fk<"inventory_logs_variant_id_fkey", "variant_id", "product_variants">,
        ];
      };
      notification_logs: {
        Row: {
          id: string;
          order_id: string | null;
          channel: NotificationChannel;
          event_type: string;
          recipient: string;
          status: string;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          channel: NotificationChannel;
          event_type: string;
          recipient: string;
          status?: string;
          error?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_logs"]["Insert"]>;
        Relationships: [Fk<"notification_logs_order_id_fkey", "order_id", "orders">];
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
          variant_id: string | null;
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
          variant_id?: string | null;
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
          user_id: string | null;
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
          discount: number;
          coupon_code: string | null;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          stripe_payment_intent_id: string | null;
          carrier: string | null;
          shipping_service: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          label_url: string | null;
          shippo_transaction_id: string | null;
          shipping_rate_id: string | null;
          stock_released_at: string | null;
        };
        Insert: {
          id?: string;
          number: string;
          user_id?: string | null;
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
          discount?: number;
          coupon_code?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          stripe_payment_intent_id?: string | null;
          carrier?: string | null;
          shipping_service?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          label_url?: string | null;
          shippo_transaction_id?: string | null;
          shipping_rate_id?: string | null;
          stock_released_at?: string | null;
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
          price: number | null;
          stock: number;
          options: Json;
          sort_order: number;
        };
        Insert: {
          id: string;
          product_id: string;
          sku_key: string;
          name: string;
          price?: number | null;
          stock?: number;
          options?: Json;
          sort_order?: number;
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
          category: string;
          category_id: string;
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
          category?: string;
          category_id: string;
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
        Relationships: [Fk<"products_category_id_fkey", "category_id", "categories">];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          role: UserRole;
          notes: string;
          disabled_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          email: string;
          phone?: string;
          role?: UserRole;
          notes?: string;
          disabled_at?: string | null;
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
      stripe_events: {
        Row: {
          id: string;
          type: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          type: string;
          processed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stripe_events"]["Insert"]>;
        Relationships: [];
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
          tax_rate: number;
          free_shipping_threshold: number;
          fallback_standard_shipping: number;
          fallback_express_shipping: number;
          fallback_overnight_shipping: number;
          origin_name: string;
          origin_line1: string;
          origin_city: string;
          origin_state: string;
          origin_zip: string;
          origin_country: string;
          demo_mode: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          origin?: string;
          support_email?: string;
          tax_rate?: number;
          free_shipping_threshold?: number;
          fallback_standard_shipping?: number;
          fallback_express_shipping?: number;
          fallback_overnight_shipping?: number;
          origin_name?: string;
          origin_line1?: string;
          origin_city?: string;
          origin_state?: string;
          origin_zip?: string;
          origin_country?: string;
          demo_mode?: boolean;
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
          p_coupon_code?: string | null;
          p_guest?: Json | null;
          p_shipping_amount?: number | null;
          p_shipping_meta?: Json | null;
        };
        Returns: string;
      };
      restock_order: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      confirm_order_paid: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      delivery_method: DeliveryMethod;
      fulfillment_status: FulfillmentStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
