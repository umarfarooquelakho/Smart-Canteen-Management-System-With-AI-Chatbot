/**
 * Central order management service.
 * All state transitions live here so business rules are enforced in one place.
 * EmailJS notifications are fired at every lifecycle event (non-fatal).
 */
import type { Order, OrderItem, User, OrderStatus } from '../types';
import {
  ordersDB, menuDB, slotsDB, notificationsDB, queueDB,
  staffLogsDB, cancellationsDB, availabilityHistoryDB,
} from '../lib/db';
import { useAppStore } from '../store/appStore';
import { enqueueOrder, estimatePreparationTime, reScoreQueue } from './queueService';
import { nanoid } from '../utils/nanoid';
import {
  sendOrderConfirmationEmail,
  sendOrderAcceptedEmail,
  sendOrderPreparingEmail,
  sendOrderReadyEmail,
  sendOrderDelayedEmail,
  sendOrderCancelledEmail,
  sendOrderRejectedEmail,
  sendOrderCompletedEmail,
} from './emailService';

// ---------- VALID TRANSITIONS -------------------------------------------
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  placed:        ['accepted', 'cancelled', 'rejected'],
  accepted:      ['preparing', 'rejected', 'cancelled'],
  preparing:     ['ready', 'delayed'],
  delayed:       ['ready', 'preparing'],
  ready:         ['collected', 'not_collected'],
  collected:     ['completed'],
  completed:     [],
  cancelled:     [],
  rejected:      [],
  not_collected: [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---------- IN-APP NOTIFICATION HELPER ----------------------------------
function sendInAppNotification(
  userId: string,
  orderId: string,
  type: Parameters<typeof notificationsDB.create>[0]['type'],
  title: string,
  message: string,
) {
  notificationsDB.create({
    id: `notif-${nanoid(8)}`,
    user_id: userId,
    order_id: orderId,
    type,
    title,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  });
  useAppStore.getState().refreshNotifs();
}

// ---------- STAFF LOG HELPER --------------------------------------------
function logStaffAction(userId: string, action: string, orderId?: string, details?: string) {
  staffLogsDB.create({
    id: `log-${nanoid(8)}`,
    user_id: userId,
    action,
    order_id: orderId,
    details,
    created_at: new Date().toISOString(),
  });
}

// ---------- RESOLVE CUSTOMER FROM ORDER ---------------------------------
function resolveCustomer(order: Order): User | null {
  // customer may be embedded on the order object already
  return (order.customer as User) ?? null;
}

// ---------- CREATE ORDER ------------------------------------------------
export interface CreateOrderPayload {
  customer: User;
  items: Array<{ item_id: string; quantity: number; special_instruction?: string }>;
  pickup_slot_id?: string;
  special_notes?: string;
  idempotency_key: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { customer, items, pickup_slot_id, special_notes, idempotency_key } = payload;

  // ── Idempotency check ────────────────────────────────────────────────
  const existing = ordersDB.getAll().find((o) => o.idempotency_key === idempotency_key);
  if (existing) return existing;

  // ── Validate items & stock ───────────────────────────────────────────
  const orderItems: OrderItem[] = [];
  let totalAmount = 0;

  for (const { item_id, quantity, special_instruction } of items) {
    const menuItem = menuDB.getById(item_id);
    if (!menuItem) throw new Error(`Item ${item_id} not found.`);
    if (menuItem.status === 'sold_out') throw new Error(`${menuItem.name} is sold out.`);
    if (menuItem.available_quantity < quantity)
      throw new Error(`Only ${menuItem.available_quantity} of ${menuItem.name} available.`);

    orderItems.push({
      id: `oi-${nanoid(8)}`,
      order_id: '',           // filled below
      item_id,
      menu_item: menuItem,
      quantity,
      price: menuItem.price,
      special_instruction,
    });
    totalAmount += menuItem.price * quantity;
  }

  // ── Pickup slot validation ───────────────────────────────────────────
  let pickupTime: string | undefined;
  if (pickup_slot_id) {
    const slot = slotsDB.getById(pickup_slot_id);
    if (!slot) throw new Error('Pickup slot not found.');
    if (slot.status === 'full') throw new Error('Selected pickup slot is full. Please choose another.');
    pickupTime = new Date(
      `${new Date().toISOString().split('T')[0]}T${slot.end_time}:00`,
    ).toISOString();
    slotsDB.incrementSlot(pickup_slot_id);
  }

  const token    = ordersDB.generateToken();
  const orderId  = `order-${nanoid(8)}`;

  // ── Estimate prep time ───────────────────────────────────────────────
  const prepMinutes = estimatePreparationTime({
    id: orderId,
    customer_id: customer.id,
    token_number: token,
    items: orderItems,
    total_amount: totalAmount,
    order_time: new Date().toISOString(),
    pickup_time: pickupTime,
    order_status: 'placed',
    payment_status: 'paid',
    priority_score: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Order);

  const estimatedReadyTime = new Date(Date.now() + prepMinutes * 60_000).toISOString();

  const order: Order = {
    id: orderId,
    customer_id: customer.id,
    customer,
    token_number: token,
    items: orderItems.map((oi) => ({ ...oi, order_id: orderId })),
    total_amount: totalAmount,
    order_time: new Date().toISOString(),
    pickup_time: pickupTime,
    estimated_ready_time: estimatedReadyTime,
    order_status: 'placed',
    payment_status: 'paid',
    priority_score: 50,
    special_notes,
    idempotency_key,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ordersDB.create(order);

  // ── Decrement stock & track availability changes ─────────────────────
  for (const { item_id, quantity } of items) {
    const before = menuDB.getById(item_id);
    menuDB.decrementQuantity(item_id, quantity);
    const after = menuDB.getById(item_id);
    if (before && after && before.status !== after.status) {
      availabilityHistoryDB.create({
        id: `av-${nanoid(8)}`,
        item_id,
        item_name: before.name,
        old_status: before.status,
        new_status: after.status,
        old_quantity: before.available_quantity,
        new_quantity: after.available_quantity,
        changed_by: 'system',
        changed_at: new Date().toISOString(),
      });
    }
  }

  // ── Enqueue ──────────────────────────────────────────────────────────
  enqueueOrder(order);

  // ── Email confirmation ───────────────────────────────────────────────
  sendOrderConfirmationEmail(order, customer); // fire-and-forget

  useAppStore.getState().refreshOrders();
  useAppStore.getState().refreshQueue();
  useAppStore.getState().refreshMenu();

  return order;
}

// ---------- UPDATE ORDER STATUS -----------------------------------------
export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  staffUser?: User,
  reason?: string,
): Order {
  const order = ordersDB.getById(orderId);
  if (!order) throw new Error('Order not found.');

  if (!canTransition(order.order_status, newStatus)) {
    throw new Error(`Cannot transition from ${order.order_status} to ${newStatus}.`);
  }

  const updates: Partial<Order> = { order_status: newStatus };
  const customer = resolveCustomer(order);

  // ── ACCEPTED ─────────────────────────────────────────────────────────
  if (newStatus === 'accepted') {
    sendInAppNotification(
      order.customer_id, orderId, 'order_accepted',
      'Order Accepted',
      `Your order ${order.token_number} has been accepted by the kitchen.`,
    );
    if (customer) sendOrderAcceptedEmail(order, customer);
  }

  // ── PREPARING ────────────────────────────────────────────────────────
  if (newStatus === 'preparing') {
    sendInAppNotification(
      order.customer_id, orderId, 'order_preparing',
      'Preparation Started',
      `The kitchen is now preparing your order ${order.token_number}.`,
    );
    queueDB.updateByOrder(orderId, {
      status: 'preparing',
      actual_start_time: new Date().toISOString(),
    });
    if (customer) sendOrderPreparingEmail(order, customer);
  }

  // ── READY ────────────────────────────────────────────────────────────
  if (newStatus === 'ready') {
    updates.actual_ready_time = new Date().toISOString();
    sendInAppNotification(
      order.customer_id, orderId, 'order_ready',
      '🎉 Your order is ready!',
      `Token ${order.token_number} is ready for pickup. Please show your token at the counter.`,
    );
    if (customer) sendOrderReadyEmail({ ...order, ...updates } as Order, customer);
  }

  // ── DELAYED ──────────────────────────────────────────────────────────
  if (newStatus === 'delayed') {
    sendInAppNotification(
      order.customer_id, orderId, 'order_delayed',
      'Order Delayed',
      `We apologise — order ${order.token_number} is taking longer than expected. We'll notify you when it's ready.`,
    );
    if (customer) sendOrderDelayedEmail(order, customer);
  }

  // ── COLLECTED / COMPLETED / NOT_COLLECTED ────────────────────────────
  if (['collected', 'completed', 'not_collected'].includes(newStatus)) {
    queueDB.updateByOrder(orderId, { status: 'done' });
  }

  if (newStatus === 'completed') {
    if (customer) sendOrderCompletedEmail(order, customer);
  }

  // ── CANCELLED ────────────────────────────────────────────────────────
  if (newStatus === 'cancelled') {
    cancellationsDB.create({
      id: `cancel-${nanoid(8)}`,
      order_id: orderId,
      token_number: order.token_number,
      cancelled_by: staffUser?.id ?? order.customer_id,
      cancelled_by_role: staffUser?.role ?? 'customer',
      reason: reason ?? 'Customer requested cancellation',
      created_at: new Date().toISOString(),
    });
    sendInAppNotification(
      order.customer_id, orderId, 'order_cancelled',
      'Order Cancelled',
      `Your order ${order.token_number} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    );
    queueDB.updateByOrder(orderId, { status: 'done' });
    if (customer) sendOrderCancelledEmail(order, customer, reason);
  }

  // ── REJECTED ─────────────────────────────────────────────────────────
  if (newStatus === 'rejected') {
    queueDB.updateByOrder(orderId, { status: 'done' });
    if (customer) sendOrderRejectedEmail(order, customer, reason);
  }

  // ── Persist & broadcast ──────────────────────────────────────────────
  const updated = ordersDB.update(orderId, updates);
  if (!updated) throw new Error('Failed to update order.');

  if (staffUser) {
    logStaffAction(
      staffUser.id,
      `Changed status to ${newStatus}`,
      orderId,
      `Token ${order.token_number}`,
    );
  }

  reScoreQueue();
  useAppStore.getState().refreshOrders();
  useAppStore.getState().refreshQueue();
  useAppStore.getState().refreshNotifs();

  return updated;
}

// ---------- CUSTOMER CANCEL ---------------------------------------------
export function cancelOrderByCustomer(orderId: string, customer: User): Order {
  const order = ordersDB.getById(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.customer_id !== customer.id) throw new Error('Unauthorized.');
  if (!['placed', 'accepted'].includes(order.order_status)) {
    throw new Error('You can only cancel an order before preparation begins.');
  }
  return updateOrderStatus(orderId, 'cancelled', customer, 'Customer requested cancellation');
}

// ---------- VERIFY TOKEN ------------------------------------------------
export function verifyToken(token: string): { valid: boolean; order?: Order; message: string } {
  const order = ordersDB.getByToken(token);
  if (!order) return { valid: false, message: 'Invalid token. Order not found.' };
  if (['collected', 'completed'].includes(order.order_status)) {
    return { valid: false, order, message: 'This order has already been collected.' };
  }
  if (order.order_status !== 'ready') {
    return {
      valid: false,
      order,
      message: `Order is currently ${order.order_status.toUpperCase()}, not ready for collection.`,
    };
  }
  return { valid: true, order, message: 'Token verified. Order is ready for collection.' };
}

// ---------- CONFIRM COLLECTION ------------------------------------------
export function confirmCollection(orderId: string, staffUser: User): Order {
  const order = ordersDB.getById(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.order_status !== 'ready') throw new Error('Order is not in READY status.');

  const updated = updateOrderStatus(orderId, 'collected', staffUser);

  // Auto-complete a moment after collection
  setTimeout(() => {
    try {
      updateOrderStatus(orderId, 'completed', staffUser);
    } catch {
      // already completed — swallow
    }
  }, 1_500);

  return updated;
}
