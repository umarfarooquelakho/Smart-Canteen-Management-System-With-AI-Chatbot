/**
 * In-memory + localStorage database.
 * Initializes from seed data on first load, then persists all changes.
 */
import { storage } from './storage';
import {
  DEMO_USERS, DEMO_CATEGORIES, DEMO_MENU_ITEMS, DEMO_ORDERS,
  DEMO_PICKUP_SLOTS, DEMO_NOTIFICATIONS, DEMO_QUEUE_ENTRIES,
  DEMO_STAFF_LOGS, DEMO_AVAILABILITY_HISTORY, generateHistoricalSales,
} from '../data/seed';
import type {
  User, Category, MenuItem, Order, PickupSlot,
  Notification, QueueEntry, StaffActivityLog, AvailabilityHistory,
  CancellationRecord, SalesByDay,
} from '../types';

// ---- init helpers -------------------------------------------------------
function initTable<T>(key: string, seed: T[]): T[] {
  const existing = storage.get<T[] | null>(key, null);
  if (!existing) {
    storage.set(key, seed);
    return seed;
  }
  return existing;
}

function resetTable<T>(key: string, seed: T[]): T[] {
  storage.set(key, seed);
  return seed;
}

// ---- bootstrap ----------------------------------------------------------
export function bootstrapDB(force = false) {
  const initialised = storage.get<boolean>('__initialised', false);
  if (!initialised || force) {
    resetTable('users', DEMO_USERS);
    resetTable('categories', DEMO_CATEGORIES);
    resetTable('menu_items', DEMO_MENU_ITEMS);
    resetTable('orders', DEMO_ORDERS);
    resetTable('pickup_slots', DEMO_PICKUP_SLOTS);
    resetTable('notifications', DEMO_NOTIFICATIONS);
    resetTable('queue_entries', DEMO_QUEUE_ENTRIES);
    resetTable('staff_logs', DEMO_STAFF_LOGS);
    resetTable('availability_history', DEMO_AVAILABILITY_HISTORY);
    resetTable('cancellations', []);
    resetTable('historical_sales', generateHistoricalSales());
    storage.set('__initialised', true);
  }
}

// ---- generic table helpers ----------------------------------------------
function getTable<T>(key: string): T[] {
  return storage.get<T[]>(key, []);
}

function saveTable<T>(key: string, data: T[]): void {
  storage.set(key, data);
}

// ---- USERS --------------------------------------------------------------
export const usersDB = {
  getAll: (): User[] => getTable<User>('users'),

  getById: (id: string): User | undefined =>
    getTable<User>('users').find((u) => u.id === id),

  getByEmail: (email: string): User | undefined =>
    getTable<User>('users').find((u) => u.email.toLowerCase() === email.toLowerCase()),

  create: (user: User): User => {
    const users = getTable<User>('users');
    users.push(user);
    saveTable('users', users);
    return user;
  },

  update: (id: string, changes: Partial<User>): User | null => {
    const users = getTable<User>('users');
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...changes };
    saveTable('users', users);
    return users[idx];
  },
};

// ---- CATEGORIES ---------------------------------------------------------
export const categoriesDB = {
  getAll: (): Category[] => getTable<Category>('categories').filter((c) => c.status === 'active'),
  getAllIncludingInactive: (): Category[] => getTable<Category>('categories'),

  create: (cat: Category): Category => {
    const cats = getTable<Category>('categories');
    cats.push(cat);
    saveTable('categories', cats);
    return cat;
  },

  update: (id: string, changes: Partial<Category>): Category | null => {
    const cats = getTable<Category>('categories');
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    cats[idx] = { ...cats[idx], ...changes };
    saveTable('categories', cats);
    return cats[idx];
  },

  delete: (id: string): void => {
    const cats = getTable<Category>('categories').filter((c) => c.id !== id);
    saveTable('categories', cats);
  },
};

// ---- MENU ITEMS ---------------------------------------------------------
export const menuDB = {
  getAll: (): MenuItem[] => getTable<MenuItem>('menu_items'),

  getAvailable: (): MenuItem[] =>
    getTable<MenuItem>('menu_items').filter((i) => i.status !== 'sold_out' && i.status !== 'temporarily_unavailable'),

  getById: (id: string): MenuItem | undefined =>
    getTable<MenuItem>('menu_items').find((i) => i.id === id),

  create: (item: MenuItem): MenuItem => {
    const items = getTable<MenuItem>('menu_items');
    items.push(item);
    saveTable('menu_items', items);
    return item;
  },

  update: (id: string, changes: Partial<MenuItem>): MenuItem | null => {
    const items = getTable<MenuItem>('menu_items');
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...changes, updated_at: new Date().toISOString() };
    // auto-set status based on quantity
    if (changes.available_quantity !== undefined) {
      if (items[idx].available_quantity <= 0) {
        items[idx].status = 'sold_out';
      } else if (items[idx].available_quantity <= 10 && items[idx].status === 'available') {
        items[idx].status = 'limited';
      }
    }
    saveTable('menu_items', items);
    return items[idx];
  },

  decrementQuantity: (id: string, qty: number): void => {
    const items = getTable<MenuItem>('menu_items');
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    items[idx].available_quantity = Math.max(0, items[idx].available_quantity - qty);
    if (items[idx].available_quantity === 0) items[idx].status = 'sold_out';
    else if (items[idx].available_quantity <= 10) items[idx].status = 'limited';
    items[idx].updated_at = new Date().toISOString();
    saveTable('menu_items', items);
  },

  delete: (id: string): void => {
    saveTable('menu_items', getTable<MenuItem>('menu_items').filter((i) => i.id !== id));
  },
};

// ---- ORDERS -------------------------------------------------------------
export const ordersDB = {
  getAll: (): Order[] => getTable<Order>('orders'),

  getById: (id: string): Order | undefined =>
    getTable<Order>('orders').find((o) => o.id === id),

  getByToken: (token: string): Order | undefined =>
    getTable<Order>('orders').find((o) => o.token_number === token),

  getByCustomer: (customerId: string): Order[] =>
    getTable<Order>('orders')
      .filter((o) => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),

  getByStatus: (statuses: Order['order_status'][]): Order[] =>
    getTable<Order>('orders').filter((o) => statuses.includes(o.order_status)),

  getActiveOrders: (): Order[] =>
    getTable<Order>('orders').filter((o) =>
      ['placed', 'accepted', 'preparing', 'ready', 'delayed'].includes(o.order_status)
    ),

  getTodaysOrders: (): Order[] => {
    const today = new Date().toISOString().split('T')[0];
    return getTable<Order>('orders').filter((o) => o.created_at.startsWith(today));
  },

  create: (order: Order): Order => {
    const orders = getTable<Order>('orders');
    // idempotency check
    if (order.idempotency_key) {
      const existing = orders.find((o) => o.idempotency_key === order.idempotency_key);
      if (existing) return existing;
    }
    orders.push(order);
    saveTable('orders', orders);
    return order;
  },

  update: (id: string, changes: Partial<Order>): Order | null => {
    const orders = getTable<Order>('orders');
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], ...changes, updated_at: new Date().toISOString() };
    saveTable('orders', orders);
    return orders[idx];
  },

  generateToken: (): string => {
    const orders = getTable<Order>('orders');
    const nums = orders
      .map((o) => parseInt(o.token_number.replace('C-', ''), 10))
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 20;
    return `C-${String(max + 1).padStart(3, '0')}`;
  },
};

// ---- PICKUP SLOTS -------------------------------------------------------
export const slotsDB = {
  getAll: (): PickupSlot[] => getTable<PickupSlot>('pickup_slots'),

  getAvailable: (): PickupSlot[] =>
    getTable<PickupSlot>('pickup_slots').filter(
      (s) => s.is_active && s.status !== 'full' && s.status !== 'closed'
    ),

  getById: (id: string): PickupSlot | undefined =>
    getTable<PickupSlot>('pickup_slots').find((s) => s.id === id),

  incrementSlot: (id: string): PickupSlot | null => {
    const slots = getTable<PickupSlot>('pickup_slots');
    const idx = slots.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    slots[idx].current_orders += 1;
    if (slots[idx].current_orders >= slots[idx].maximum_orders) {
      slots[idx].status = 'full';
    } else if (slots[idx].current_orders >= slots[idx].maximum_orders * 0.8) {
      slots[idx].status = 'filling_up';
    }
    saveTable('pickup_slots', slots);
    return slots[idx];
  },

  update: (id: string, changes: Partial<PickupSlot>): PickupSlot | null => {
    const slots = getTable<PickupSlot>('pickup_slots');
    const idx = slots.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    slots[idx] = { ...slots[idx], ...changes };
    saveTable('pickup_slots', slots);
    return slots[idx];
  },

  create: (slot: PickupSlot): PickupSlot => {
    const slots = getTable<PickupSlot>('pickup_slots');
    slots.push(slot);
    saveTable('pickup_slots', slots);
    return slot;
  },

  delete: (id: string): void => {
    saveTable('pickup_slots', getTable<PickupSlot>('pickup_slots').filter((s) => s.id !== id));
  },
};

// ---- NOTIFICATIONS ------------------------------------------------------
export const notificationsDB = {
  getByUser: (userId: string): Notification[] =>
    getTable<Notification>('notifications')
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),

  getUnreadCount: (userId: string): number =>
    getTable<Notification>('notifications').filter((n) => n.user_id === userId && !n.is_read).length,

  create: (notif: Notification): Notification => {
    const notifs = getTable<Notification>('notifications');
    notifs.push(notif);
    saveTable('notifications', notifs);
    return notif;
  },

  markRead: (id: string): void => {
    const notifs = getTable<Notification>('notifications');
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx !== -1) notifs[idx].is_read = true;
    saveTable('notifications', notifs);
  },

  markAllRead: (userId: string): void => {
    const notifs = getTable<Notification>('notifications').map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n
    );
    saveTable('notifications', notifs);
  },
};

// ---- QUEUE ENTRIES ------------------------------------------------------
export const queueDB = {
  getAll: (): QueueEntry[] =>
    getTable<QueueEntry>('queue_entries')
      .filter((q) => q.status !== 'done')
      .sort((a, b) => b.priority_score - a.priority_score),

  getByOrder: (orderId: string): QueueEntry | undefined =>
    getTable<QueueEntry>('queue_entries').find((q) => q.order_id === orderId),

  create: (entry: QueueEntry): QueueEntry => {
    const entries = getTable<QueueEntry>('queue_entries');
    entries.push(entry);
    saveTable('queue_entries', entries);
    return entry;
  },

  update: (id: string, changes: Partial<QueueEntry>): QueueEntry | null => {
    const entries = getTable<QueueEntry>('queue_entries');
    const idx = entries.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    entries[idx] = { ...entries[idx], ...changes, updated_at: new Date().toISOString() };
    saveTable('queue_entries', entries);
    return entries[idx];
  },

  updateByOrder: (orderId: string, changes: Partial<QueueEntry>): void => {
    const entries = getTable<QueueEntry>('queue_entries');
    const idx = entries.findIndex((q) => q.order_id === orderId);
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], ...changes, updated_at: new Date().toISOString() };
      saveTable('queue_entries', entries);
    }
  },
};

// ---- STAFF LOGS ---------------------------------------------------------
export const staffLogsDB = {
  getAll: (): StaffActivityLog[] =>
    getTable<StaffActivityLog>('staff_logs')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),

  create: (log: StaffActivityLog): void => {
    const logs = getTable<StaffActivityLog>('staff_logs');
    logs.push(log);
    saveTable('staff_logs', logs);
  },
};

// ---- AVAILABILITY HISTORY -----------------------------------------------
export const availabilityHistoryDB = {
  getAll: (): AvailabilityHistory[] =>
    getTable<AvailabilityHistory>('availability_history')
      .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()),

  create: (entry: AvailabilityHistory): void => {
    const history = getTable<AvailabilityHistory>('availability_history');
    history.push(entry);
    saveTable('availability_history', history);
  },
};

// ---- CANCELLATIONS ------------------------------------------------------
export const cancellationsDB = {
  getAll: (): CancellationRecord[] => getTable<CancellationRecord>('cancellations'),

  create: (record: CancellationRecord): void => {
    const records = getTable<CancellationRecord>('cancellations');
    records.push(record);
    saveTable('cancellations', records);
  },
};

// ---- HISTORICAL SALES ---------------------------------------------------
export const salesDB = {
  getAll: (): SalesByDay[] => getTable<SalesByDay>('historical_sales'),
};
