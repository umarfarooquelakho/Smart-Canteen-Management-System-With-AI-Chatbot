import type {
  User, Category, MenuItem, Order, OrderItem,
  PickupSlot, Notification, QueueEntry, StaffActivityLog,
  AvailabilityHistory, CancellationRecord
} from '../types';

// ============================================================
// DEMO USERS
// ============================================================
export const DEMO_USERS: User[] = [
  {
    id: 'user-customer-1',
    name: 'Alex Johnson',
    email: 'customer@demo.com',
    role: 'customer',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    phone: '+92-300-1234567',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user-customer-2',
    name: 'Sarah Ahmed',
    email: 'sarah@demo.com',
    role: 'customer',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    phone: '+92-301-2345678',
    created_at: '2026-09-05T08:00:00Z',
  },
  {
    id: 'user-customer-3',
    name: 'Omar Khan',
    email: 'omar@demo.com',
    role: 'customer',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
    phone: '+92-302-3456789',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: 'user-staff-1',
    name: 'Raza Ali',
    email: 'staff@demo.com',
    role: 'staff',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raza',
    phone: '+92-303-4567890',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'user-staff-2',
    name: 'Fatima Malik',
    email: 'fatima@demo.com',
    role: 'staff',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    phone: '+92-304-5678901',
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: 'user-manager-1',
    name: 'Kamran Sheikh',
    email: 'manager@demo.com',
    role: 'manager',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamran',
    phone: '+92-305-6789012',
    created_at: '2026-07-01T08:00:00Z',
  },
  {
    id: 'user-admin-1',
    name: 'System Admin',
    email: 'admin@demo.com',
    role: 'admin',
    account_status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    phone: '+92-306-7890123',
    created_at: '2026-06-01T08:00:00Z',
  },
];

export const DEMO_PASSWORDS: Record<string, string> = {
  'customer@demo.com': 'customer123',
  'sarah@demo.com': 'sarah123',
  'omar@demo.com': 'omar123',
  'staff@demo.com': 'staff123',
  'fatima@demo.com': 'fatima123',
  'manager@demo.com': 'manager123',
  'admin@demo.com': 'admin123',
};

// ============================================================
// CATEGORIES
// ============================================================
export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Burgers', icon: '🍔', status: 'active', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Meals', icon: '🍽️', status: 'active', sort_order: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Snacks', icon: '🍟', status: 'active', sort_order: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-4', name: 'Drinks', icon: '🥤', status: 'active', sort_order: 4, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-5', name: 'Desserts', icon: '🍰', status: 'active', sort_order: 5, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-6', name: 'Breakfast', icon: '🥐', status: 'active', sort_order: 6, created_at: '2026-01-01T00:00:00Z' },
];

// ============================================================
// MENU ITEMS
// ============================================================
export const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Classic Chicken Burger',
    category_id: 'cat-1',
    description: 'Juicy grilled chicken with lettuce, tomato, and our signature sauce on a toasted brioche bun.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    available_quantity: 25,
    preparation_time: 8,
    status: 'available',
    is_popular: true,
    is_featured: true,
    tags: ['bestseller', 'spicy'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-2',
    name: 'Double Beef Burger',
    category_id: 'cat-1',
    description: 'Two beef patties with cheddar cheese, pickles, onions, and special sauce.',
    price: 650,
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
    available_quantity: 15,
    preparation_time: 10,
    status: 'available',
    is_popular: true,
    is_featured: false,
    tags: ['bestseller'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-3',
    name: 'Veggie Burger',
    category_id: 'cat-1',
    description: 'House-made veggie patty with avocado, sprouts, and herbed mayo.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
    available_quantity: 8,
    preparation_time: 7,
    status: 'limited',
    is_popular: false,
    is_featured: false,
    tags: ['vegetarian', 'healthy'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-4',
    name: 'Chicken Biryani',
    category_id: 'cat-2',
    description: 'Fragrant basmati rice slow-cooked with tender chicken, spices, and saffron.',
    price: 500,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d5bc?w=400&h=300&fit=crop',
    available_quantity: 20,
    preparation_time: 15,
    status: 'available',
    is_popular: true,
    is_featured: true,
    tags: ['bestseller', 'spicy'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-5',
    name: 'Karahi Chicken',
    category_id: 'cat-2',
    description: 'Classic Pakistani karahi with tender chicken pieces in a spiced tomato sauce, served with naan.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    available_quantity: 12,
    preparation_time: 20,
    status: 'available',
    is_popular: true,
    is_featured: false,
    tags: ['spicy', 'traditional'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-6',
    name: 'Daal Chawal',
    category_id: 'cat-2',
    description: 'Creamy lentil curry served with steamed basmati rice.',
    price: 250,
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    available_quantity: 30,
    preparation_time: 10,
    status: 'available',
    is_popular: false,
    is_featured: false,
    tags: ['vegetarian', 'budget-friendly'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-7',
    name: 'Crispy Fries',
    category_id: 'cat-3',
    description: 'Golden crispy fries seasoned with our house spice blend, served with ketchup.',
    price: 150,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    available_quantity: 50,
    preparation_time: 5,
    status: 'available',
    is_popular: true,
    is_featured: false,
    tags: ['quick', 'snack'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-8',
    name: 'Chicken Wings (6 pcs)',
    category_id: 'cat-3',
    description: 'Crispy fried chicken wings tossed in buffalo sauce.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
    available_quantity: 0,
    preparation_time: 12,
    status: 'sold_out',
    is_popular: true,
    is_featured: false,
    tags: ['spicy', 'snack'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-9',
    name: 'Samosa (2 pcs)',
    category_id: 'cat-3',
    description: 'Crispy golden samosas filled with spiced potato and peas.',
    price: 80,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    available_quantity: 40,
    preparation_time: 3,
    status: 'available',
    is_popular: false,
    is_featured: false,
    tags: ['vegetarian', 'quick', 'snack'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-10',
    name: 'Mango Lassi',
    category_id: 'cat-4',
    description: 'Refreshing blend of ripe mango and creamy yogurt.',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1554780008-9f6a29fc2fbb?w=400&h=300&fit=crop',
    available_quantity: 25,
    preparation_time: 3,
    status: 'available',
    is_popular: true,
    is_featured: true,
    tags: ['cold', 'refreshing'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-11',
    name: 'Cold Coffee',
    category_id: 'cat-4',
    description: 'Rich chilled coffee blended with milk and a hint of vanilla.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    available_quantity: 20,
    preparation_time: 4,
    status: 'available',
    is_popular: true,
    is_featured: false,
    tags: ['cold', 'refreshing'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-12',
    name: 'Mineral Water',
    category_id: 'cat-4',
    description: 'Pure chilled mineral water, 500ml.',
    price: 50,
    image_url: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=400&h=300&fit=crop',
    available_quantity: 100,
    preparation_time: 1,
    status: 'available',
    is_popular: false,
    is_featured: false,
    tags: ['cold'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-13',
    name: 'Chocolate Cake Slice',
    category_id: 'cat-5',
    description: 'Moist dark chocolate cake with ganache frosting.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    available_quantity: 10,
    preparation_time: 2,
    status: 'limited',
    is_popular: true,
    is_featured: false,
    tags: ['sweet', 'indulgent'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-14',
    name: 'Kheer',
    category_id: 'cat-5',
    description: 'Traditional rice pudding with cardamom and pistachios.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',
    available_quantity: 15,
    preparation_time: 2,
    status: 'available',
    is_popular: false,
    is_featured: false,
    tags: ['sweet', 'traditional'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-15',
    name: 'Paratha & Egg',
    category_id: 'cat-6',
    description: 'Crispy whole-wheat paratha served with a fried egg and mint chutney.',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    available_quantity: 20,
    preparation_time: 8,
    status: 'available',
    is_popular: false,
    is_featured: false,
    tags: ['breakfast', 'traditional'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
];

// ============================================================
// PICKUP SLOTS
// ============================================================
export const DEMO_PICKUP_SLOTS: PickupSlot[] = [
  { id: 'slot-1', start_time: '12:00', end_time: '12:15', maximum_orders: 20, current_orders: 18, status: 'filling_up', is_active: true },
  { id: 'slot-2', start_time: '12:15', end_time: '12:30', maximum_orders: 20, current_orders: 20, status: 'full', is_active: true },
  { id: 'slot-3', start_time: '12:30', end_time: '12:45', maximum_orders: 20, current_orders: 12, status: 'available', is_active: true },
  { id: 'slot-4', start_time: '12:45', end_time: '13:00', maximum_orders: 20, current_orders: 5, status: 'available', is_active: true },
  { id: 'slot-5', start_time: '13:00', end_time: '13:15', maximum_orders: 20, current_orders: 3, status: 'available', is_active: true },
  { id: 'slot-6', start_time: '13:15', end_time: '13:30', maximum_orders: 20, current_orders: 0, status: 'available', is_active: true },
  { id: 'slot-7', start_time: '13:30', end_time: '13:45', maximum_orders: 20, current_orders: 0, status: 'available', is_active: true },
  { id: 'slot-8', start_time: '13:45', end_time: '14:00', maximum_orders: 20, current_orders: 0, status: 'available', is_active: true },
  { id: 'slot-9', start_time: '14:00', end_time: '14:15', maximum_orders: 15, current_orders: 0, status: 'available', is_active: true },
  { id: 'slot-10', start_time: '14:15', end_time: '14:30', maximum_orders: 15, current_orders: 0, status: 'available', is_active: true },
];

// ============================================================
// HISTORICAL ORDERS (for analytics)
// ============================================================
function makeOrder(
  id: string,
  tokenNum: string,
  customerId: string,
  status: Order['order_status'],
  items: OrderItem[],
  pickupTime: string,
  orderTime: string,
  totalAmount: number,
  priorityScore = 50,
  estimatedReadyTime?: string,
  actualReadyTime?: string,
): Order {
  return {
    id,
    customer_id: customerId,
    token_number: tokenNum,
    items,
    total_amount: totalAmount,
    order_time: orderTime,
    pickup_time: pickupTime,
    estimated_ready_time: estimatedReadyTime,
    actual_ready_time: actualReadyTime,
    order_status: status,
    payment_status: status === 'cancelled' || status === 'rejected' ? 'refunded' : 'paid',
    priority_score: priorityScore,
    created_at: orderTime,
    updated_at: orderTime,
  };
}

const today = new Date('2026-10-01');
const todayStr = '2026-10-01';

export const DEMO_ORDERS: Order[] = [
  // TODAY - ACTIVE ORDERS
  makeOrder('order-001', 'C-021', 'user-customer-1', 'preparing', [
    { id: 'oi-001-1', order_id: 'order-001', item_id: 'item-1', quantity: 2, price: 450, special_instruction: 'Extra sauce' },
    { id: 'oi-001-2', order_id: 'order-001', item_id: 'item-7', quantity: 1, price: 150 },
  ], `${todayStr}T13:00:00Z`, `${todayStr}T12:45:00Z`, 1050, 85,
    `${todayStr}T12:58:00Z`),

  makeOrder('order-002', 'C-022', 'user-customer-2', 'preparing', [
    { id: 'oi-002-1', order_id: 'order-002', item_id: 'item-4', quantity: 1, price: 500 },
    { id: 'oi-002-2', order_id: 'order-002', item_id: 'item-10', quantity: 1, price: 180 },
  ], `${todayStr}T13:00:00Z`, `${todayStr}T12:43:00Z`, 680, 78,
    `${todayStr}T12:58:00Z`),

  makeOrder('order-003', 'C-023', 'user-customer-3', 'accepted', [
    { id: 'oi-003-1', order_id: 'order-003', item_id: 'item-2', quantity: 1, price: 650, special_instruction: 'No pickles' },
    { id: 'oi-003-2', order_id: 'order-003', item_id: 'item-11', quantity: 1, price: 200 },
  ], `${todayStr}T13:15:00Z`, `${todayStr}T12:50:00Z`, 850, 65,
    `${todayStr}T13:10:00Z`),

  makeOrder('order-004', 'C-024', 'user-customer-1', 'placed', [
    { id: 'oi-004-1', order_id: 'order-004', item_id: 'item-5', quantity: 1, price: 600 },
    { id: 'oi-004-2', order_id: 'order-004', item_id: 'item-12', quantity: 2, price: 50 },
  ], `${todayStr}T13:30:00Z`, `${todayStr}T12:55:00Z`, 700, 55,
    `${todayStr}T13:25:00Z`),

  makeOrder('order-005', 'C-025', 'user-customer-2', 'placed', [
    { id: 'oi-005-1', order_id: 'order-005', item_id: 'item-9', quantity: 2, price: 80 },
    { id: 'oi-005-2', order_id: 'order-005', item_id: 'item-10', quantity: 1, price: 180 },
  ], `${todayStr}T13:30:00Z`, `${todayStr}T12:57:00Z`, 340, 48),

  makeOrder('order-006', 'C-026', 'user-customer-3', 'ready', [
    { id: 'oi-006-1', order_id: 'order-006', item_id: 'item-1', quantity: 1, price: 450 },
    { id: 'oi-006-2', order_id: 'order-006', item_id: 'item-13', quantity: 1, price: 200 },
  ], `${todayStr}T12:45:00Z`, `${todayStr}T12:30:00Z`, 650, 92,
    `${todayStr}T12:42:00Z`, `${todayStr}T12:43:00Z`),

  makeOrder('order-007', 'C-027', 'user-customer-1', 'delayed', [
    { id: 'oi-007-1', order_id: 'order-007', item_id: 'item-5', quantity: 2, price: 600 },
    { id: 'oi-007-2', order_id: 'order-007', item_id: 'item-7', quantity: 2, price: 150 },
  ], `${todayStr}T12:45:00Z`, `${todayStr}T12:20:00Z`, 1500, 95,
    `${todayStr}T12:40:00Z`),

  // TODAY - COMPLETED
  makeOrder('order-010', 'C-010', 'user-customer-2', 'completed', [
    { id: 'oi-010-1', order_id: 'order-010', item_id: 'item-4', quantity: 1, price: 500 },
  ], `${todayStr}T12:00:00Z`, `${todayStr}T11:45:00Z`, 500, 30,
    `${todayStr}T11:58:00Z`, `${todayStr}T12:02:00Z`),

  makeOrder('order-011', 'C-011', 'user-customer-3', 'completed', [
    { id: 'oi-011-1', order_id: 'order-011', item_id: 'item-1', quantity: 1, price: 450 },
    { id: 'oi-011-2', order_id: 'order-011', item_id: 'item-11', quantity: 1, price: 200 },
  ], `${todayStr}T12:00:00Z`, `${todayStr}T11:42:00Z`, 650, 35,
    `${todayStr}T11:58:00Z`, `${todayStr}T12:01:00Z`),

  makeOrder('order-012', 'C-012', 'user-customer-1', 'completed', [
    { id: 'oi-012-1', order_id: 'order-012', item_id: 'item-6', quantity: 1, price: 250 },
    { id: 'oi-012-2', order_id: 'order-012', item_id: 'item-10', quantity: 1, price: 180 },
  ], `${todayStr}T11:45:00Z`, `${todayStr}T11:30:00Z`, 430, 28,
    `${todayStr}T11:42:00Z`, `${todayStr}T11:44:00Z`),

  makeOrder('order-013', 'C-013', 'user-customer-2', 'completed', [
    { id: 'oi-013-1', order_id: 'order-013', item_id: 'item-2', quantity: 1, price: 650 },
    { id: 'oi-013-2', order_id: 'order-013', item_id: 'item-7', quantity: 1, price: 150 },
  ], `${todayStr}T11:30:00Z`, `${todayStr}T11:15:00Z`, 800, 25),

  makeOrder('order-014', 'C-014', 'user-customer-3', 'completed', [
    { id: 'oi-014-1', order_id: 'order-014', item_id: 'item-15', quantity: 1, price: 180 },
    { id: 'oi-014-2', order_id: 'order-014', item_id: 'item-12', quantity: 1, price: 50 },
  ], `${todayStr}T11:15:00Z`, `${todayStr}T11:00:00Z`, 230, 20),

  // CANCELLED
  makeOrder('order-020', 'C-015', 'user-customer-1', 'cancelled', [
    { id: 'oi-020-1', order_id: 'order-020', item_id: 'item-4', quantity: 1, price: 500 },
  ], `${todayStr}T13:00:00Z`, `${todayStr}T12:30:00Z`, 500, 10),
];

// ============================================================
// QUEUE ENTRIES
// ============================================================
export const DEMO_QUEUE_ENTRIES: QueueEntry[] = [
  {
    id: 'q-001', order_id: 'order-001', position: 1, priority_score: 85,
    estimated_start_time: `${todayStr}T12:46:00Z`,
    estimated_ready_time: `${todayStr}T12:58:00Z`,
    actual_start_time: `${todayStr}T12:46:00Z`,
    status: 'preparing', created_at: `${todayStr}T12:45:00Z`, updated_at: `${todayStr}T12:46:00Z`
  },
  {
    id: 'q-002', order_id: 'order-002', position: 2, priority_score: 78,
    estimated_start_time: `${todayStr}T12:48:00Z`,
    estimated_ready_time: `${todayStr}T12:58:00Z`,
    actual_start_time: `${todayStr}T12:48:00Z`,
    status: 'preparing', created_at: `${todayStr}T12:43:00Z`, updated_at: `${todayStr}T12:48:00Z`
  },
  {
    id: 'q-003', order_id: 'order-003', position: 3, priority_score: 65,
    estimated_start_time: `${todayStr}T13:00:00Z`,
    estimated_ready_time: `${todayStr}T13:10:00Z`,
    status: 'waiting', created_at: `${todayStr}T12:50:00Z`, updated_at: `${todayStr}T12:50:00Z`
  },
  {
    id: 'q-004', order_id: 'order-004', position: 4, priority_score: 55,
    estimated_start_time: `${todayStr}T13:10:00Z`,
    estimated_ready_time: `${todayStr}T13:25:00Z`,
    status: 'waiting', created_at: `${todayStr}T12:55:00Z`, updated_at: `${todayStr}T12:55:00Z`
  },
  {
    id: 'q-005', order_id: 'order-005', position: 5, priority_score: 48,
    estimated_start_time: `${todayStr}T13:15:00Z`,
    estimated_ready_time: `${todayStr}T13:23:00Z`,
    status: 'waiting', created_at: `${todayStr}T12:57:00Z`, updated_at: `${todayStr}T12:57:00Z`
  },
  {
    id: 'q-007', order_id: 'order-007', position: 0, priority_score: 95,
    estimated_start_time: `${todayStr}T12:20:00Z`,
    estimated_ready_time: `${todayStr}T12:40:00Z`,
    actual_start_time: `${todayStr}T12:20:00Z`,
    status: 'preparing', delay_minutes: 15,
    created_at: `${todayStr}T12:20:00Z`, updated_at: `${todayStr}T12:20:00Z`
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1', user_id: 'user-customer-1', order_id: 'order-001',
    type: 'order_accepted', title: 'Order Accepted!',
    message: 'Your order C-021 has been accepted by the kitchen staff.',
    is_read: false, created_at: `${todayStr}T12:46:00Z`
  },
  {
    id: 'notif-2', user_id: 'user-customer-1', order_id: 'order-001',
    type: 'order_preparing', title: 'Preparation Started',
    message: 'The kitchen has started preparing your order C-021. Estimated ready in 12 minutes.',
    is_read: false, created_at: `${todayStr}T12:47:00Z`
  },
  {
    id: 'notif-3', user_id: 'user-customer-2', order_id: 'order-006',
    type: 'order_ready', title: '🎉 Order Ready for Pickup!',
    message: 'Your order C-026 is ready! Please show your token at the collection counter.',
    is_read: true, created_at: `${todayStr}T12:43:00Z`
  },
  {
    id: 'notif-4', user_id: 'user-customer-1', order_id: 'order-007',
    type: 'order_delayed', title: 'Order Delayed',
    message: 'We apologize, your order C-027 is taking longer than expected. Updated ETA: 15 minutes.',
    is_read: false, created_at: `${todayStr}T12:50:00Z`
  },
  {
    id: 'notif-5', user_id: 'user-customer-1', order_id: 'order-020',
    type: 'order_cancelled', title: 'Order Cancelled',
    message: 'Your order C-015 has been cancelled. Refund will be processed shortly.',
    is_read: true, created_at: `${todayStr}T12:32:00Z`
  },
];

// ============================================================
// STAFF ACTIVITY LOGS
// ============================================================
export const DEMO_STAFF_LOGS: StaffActivityLog[] = [
  { id: 'log-1', user_id: 'user-staff-1', action: 'Accepted order', order_id: 'order-001', details: 'Token C-021', created_at: `${todayStr}T12:46:00Z` },
  { id: 'log-2', user_id: 'user-staff-1', action: 'Started preparation', order_id: 'order-001', details: 'Token C-021', created_at: `${todayStr}T12:47:00Z` },
  { id: 'log-3', user_id: 'user-staff-1', action: 'Accepted order', order_id: 'order-002', details: 'Token C-022', created_at: `${todayStr}T12:44:00Z` },
  { id: 'log-4', user_id: 'user-staff-2', action: 'Marked order ready', order_id: 'order-006', details: 'Token C-026', created_at: `${todayStr}T12:43:00Z` },
  { id: 'log-5', user_id: 'user-staff-1', action: 'Marked order delayed', order_id: 'order-007', details: 'Token C-027 - Kitchen busy', created_at: `${todayStr}T12:50:00Z` },
  { id: 'log-6', user_id: 'user-staff-2', action: 'Verified collection', order_id: 'order-010', details: 'Token C-010', created_at: `${todayStr}T12:05:00Z` },
];

// ============================================================
// AVAILABILITY HISTORY (for analytics)
// ============================================================
export const DEMO_AVAILABILITY_HISTORY: AvailabilityHistory[] = [
  {
    id: 'av-1', item_id: 'item-8', item_name: 'Chicken Wings (6 pcs)',
    old_status: 'available', new_status: 'sold_out',
    old_quantity: 5, new_quantity: 0,
    changed_by: 'user-staff-1', changed_at: `${todayStr}T11:30:00Z`
  },
  {
    id: 'av-2', item_id: 'item-3', item_name: 'Veggie Burger',
    old_status: 'available', new_status: 'limited',
    old_quantity: 15, new_quantity: 8,
    changed_by: 'system', changed_at: `${todayStr}T12:00:00Z`
  },
  {
    id: 'av-3', item_id: 'item-13', item_name: 'Chocolate Cake Slice',
    old_status: 'available', new_status: 'limited',
    old_quantity: 20, new_quantity: 10,
    changed_by: 'system', changed_at: `${todayStr}T11:00:00Z`
  },
];

// ============================================================
// HISTORICAL SALES DATA (30 days)
// ============================================================
export function generateHistoricalSales() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const base = isWeekend ? 60 : 150;
    const variance = Math.floor(Math.random() * 40) - 20;
    const orderCount = Math.max(10, base + variance);
    const avgOrderValue = 450 + Math.floor(Math.random() * 200);
    data.push({
      date: date.toISOString().split('T')[0],
      total_sales: orderCount * avgOrderValue,
      order_count: orderCount,
    });
  }
  return data;
}

// ============================================================
// PEAK HOURS DATA
// ============================================================
export const PEAK_HOURS_DATA = [
  { hour: 8, order_count: 15, label: '8 AM' },
  { hour: 9, order_count: 22, label: '9 AM' },
  { hour: 10, order_count: 18, label: '10 AM' },
  { hour: 11, order_count: 35, label: '11 AM' },
  { hour: 12, order_count: 68, label: '12 PM' },
  { hour: 13, order_count: 82, label: '1 PM' },
  { hour: 14, order_count: 45, label: '2 PM' },
  { hour: 15, order_count: 28, label: '3 PM' },
  { hour: 16, order_count: 20, label: '4 PM' },
  { hour: 17, order_count: 12, label: '5 PM' },
];
