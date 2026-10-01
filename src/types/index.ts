// ============================================================
// CORE TYPES
// ============================================================

export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// MENU TYPES
// ============================================================

export type ItemStatus = 'available' | 'limited' | 'sold_out' | 'temporarily_unavailable';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category_id: string;
  category?: Category;
  description: string;
  price: number;
  image_url: string;
  available_quantity: number;
  preparation_time: number; // in minutes
  status: ItemStatus;
  is_popular: boolean;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// ORDER TYPES
// ============================================================

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'collected'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'delayed'
  | 'not_collected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  menu_item?: MenuItem;
  quantity: number;
  price: number;
  special_instruction?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer?: User;
  token_number: string;
  items: OrderItem[];
  total_amount: number;
  order_time: string;
  pickup_time?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  priority_score: number;
  special_notes?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PICKUP SLOT TYPES
// ============================================================

export type SlotStatus = 'available' | 'filling_up' | 'full' | 'closed';

export interface PickupSlot {
  id: string;
  start_time: string; // HH:MM format
  end_time: string;
  date?: string; // YYYY-MM-DD, null means recurring daily
  maximum_orders: number;
  current_orders: number;
  status: SlotStatus;
  is_active: boolean;
}

// ============================================================
// CART TYPES
// ============================================================

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instruction?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_delayed'
  | 'order_cancelled'
  | 'order_rejected'
  | 'pickup_reminder'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// QUEUE TYPES
// ============================================================

export type QueueStatus = 'waiting' | 'preparing' | 'ready' | 'done';

export interface QueueEntry {
  id: string;
  order_id: string;
  order?: Order;
  position: number;
  priority_score: number;
  estimated_start_time?: string;
  estimated_ready_time?: string;
  actual_start_time?: string;
  status: QueueStatus;
  delay_minutes?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface DashboardStats {
  total_orders_today: number;
  active_orders: number;
  orders_preparing: number;
  orders_ready: number;
  completed_orders: number;
  cancelled_orders: number;
  total_sales: number;
  avg_preparation_time: number;
  avg_queue_size: number;
  delayed_orders: number;
}

export interface SalesByDay {
  date: string;
  total_sales: number;
  order_count: number;
}

export interface PopularItem {
  item_id: string;
  item_name: string;
  category: string;
  order_count: number;
  total_revenue: number;
  image_url: string;
}

export interface PeakHour {
  hour: number;
  order_count: number;
  label: string;
}

export interface PickupSlotUsage {
  slot_label: string;
  usage_count: number;
  capacity: number;
  utilization_percent: number;
}

// ============================================================
// STAFF ACTIVITY LOG
// ============================================================

export interface StaffActivityLog {
  id: string;
  user_id: string;
  user?: User;
  action: string;
  order_id?: string;
  details?: string;
  created_at: string;
}

// ============================================================
// AVAILABILITY HISTORY
// ============================================================

export interface AvailabilityHistory {
  id: string;
  item_id: string;
  item_name?: string;
  old_status: ItemStatus;
  new_status: ItemStatus;
  old_quantity: number;
  new_quantity: number;
  changed_by: string;
  changed_at: string;
}

// ============================================================
// CANCELLATION RECORD
// ============================================================

export interface CancellationRecord {
  id: string;
  order_id: string;
  token_number?: string;
  cancelled_by: string;
  cancelled_by_role: UserRole;
  reason: string;
  created_at: string;
}

// ============================================================
// AI INSIGHT TYPES
// ============================================================

export interface AIInsight {
  id: string;
  type: 'demand_prediction' | 'peak_time' | 'waste_prediction' | 'delay_prediction' | 'sales_insight' | 'recommendation';
  title: string;
  message: string;
  confidence: number; // 0-100
  item_id?: string;
  item_name?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface FoodRecommendation {
  menu_item: MenuItem;
  score: number;
  reason: string;
}

// ============================================================
// FILTER/SORT TYPES
// ============================================================

export type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'fastest';

export interface MenuFilters {
  category_id?: string;
  search?: string;
  price_max?: number;
  price_min?: number;
  availability?: ItemStatus[];
  preparation_time_max?: number;
  sort: SortOption;
}

// ============================================================
// PAYMENT TYPES
// ============================================================

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  method: 'cash' | 'card' | 'upi' | 'wallet';
  transaction_reference?: string;
  created_at: string;
}
