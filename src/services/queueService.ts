/**
 * Smart Queue Prioritization & Preparation Time Engine
 */
import type { Order, QueueEntry } from '../types';
import { ordersDB, queueDB, menuDB } from '../lib/db';

// Configurable weights
const WEIGHTS = {
  lateness: 40,       // how many minutes past estimated ready time
  pickupUrgency: 30,  // minutes until pickup time
  waitingTime: 20,    // how long order has been waiting
  preparation: 10,    // inversely proportional to prep time left
};

/**
 * Calculate a priority score (0-100) for a queue entry.
 * Higher = more urgent.
 */
export function calculatePriorityScore(order: Order): number {
  const now = new Date();
  let score = 0;

  // 1. Lateness: are we past estimated ready time?
  if (order.estimated_ready_time) {
    const estReady = new Date(order.estimated_ready_time);
    const minutesLate = (now.getTime() - estReady.getTime()) / 60000;
    const latenessScore = Math.min(100, Math.max(0, minutesLate * 5));
    score += latenessScore * (WEIGHTS.lateness / 100);
  }

  // 2. Pickup urgency: how close is the pickup time?
  if (order.pickup_time) {
    const pickup = new Date(order.pickup_time);
    const minutesUntilPickup = (pickup.getTime() - now.getTime()) / 60000;
    const urgencyScore = minutesUntilPickup <= 0
      ? 100
      : minutesUntilPickup <= 5
      ? 90
      : minutesUntilPickup <= 10
      ? 70
      : minutesUntilPickup <= 20
      ? 40
      : 10;
    score += urgencyScore * (WEIGHTS.pickupUrgency / 100);
  }

  // 3. Waiting time: how long has order been placed?
  const orderTime = new Date(order.order_time);
  const waitingMinutes = (now.getTime() - orderTime.getTime()) / 60000;
  const waitScore = Math.min(100, waitingMinutes * 2);
  score += waitScore * (WEIGHTS.waitingTime / 100);

  // 4. Preparation complexity (more items = lower priority bump since it takes longer)
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const prepScore = Math.max(0, 100 - totalItems * 5);
  score += prepScore * (WEIGHTS.preparation / 100);

  return Math.min(100, Math.round(score));
}

/**
 * Estimate total preparation time for an order based on items + kitchen load.
 */
export function estimatePreparationTime(order: Order): number {
  // Base time = max single-item prep time (items are prepared in parallel) + overhead
  const items = order.items.map((oi) => {
    const menuItem = menuDB.getById(oi.item_id);
    return { prepTime: menuItem?.preparation_time ?? 8, qty: oi.quantity };
  });

  if (items.length === 0) return 10;

  // Parallel cooking: base is the slowest item + 2 min per extra identical item
  const maxItemTime = Math.max(...items.map((i) => i.prepTime));
  const extraTime = items.reduce((sum, i) => sum + Math.max(0, i.qty - 1) * 2, 0);

  // Kitchen workload factor
  const activeOrders = ordersDB.getByStatus(['accepted', 'preparing']).length;
  const workloadFactor = 1 + Math.min(activeOrders * 0.1, 0.8);

  return Math.round((maxItemTime + extraTime) * workloadFactor);
}

/**
 * Compute the scheduled preparation start time for a future pickup order.
 */
export function computeStartTime(pickupTime: string, prepMinutes: number): Date {
  const pickup = new Date(pickupTime);
  return new Date(pickup.getTime() - prepMinutes * 60000 - 2 * 60000); // 2 min buffer
}

/**
 * Create a queue entry for a new order.
 */
export function enqueueOrder(order: Order): QueueEntry {
  const priority = calculatePriorityScore(order);
  const prepMinutes = estimatePreparationTime(order);
  const now = new Date();

  const activeCount = queueDB.getAll().filter((q) => q.status === 'preparing').length;
  const estimatedStart = activeCount < 3
    ? now
    : new Date(now.getTime() + activeCount * 2 * 60000);

  const estimatedReady = new Date(estimatedStart.getTime() + prepMinutes * 60000);

  const queueLength = queueDB.getAll().filter((q) => q.status === 'waiting').length;

  const entry: QueueEntry = {
    id: `q-${Date.now()}`,
    order_id: order.id,
    position: queueLength + 1,
    priority_score: priority,
    estimated_start_time: estimatedStart.toISOString(),
    estimated_ready_time: estimatedReady.toISOString(),
    status: 'waiting',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  return queueDB.create(entry);
}

/**
 * Re-score all active queue entries (call when order landscape changes).
 */
export function reScoreQueue(): void {
  const entries = queueDB.getAll();
  entries.forEach((entry) => {
    const order = ordersDB.getById(entry.order_id);
    if (!order) return;
    const newScore = calculatePriorityScore(order);
    queueDB.update(entry.id, { priority_score: newScore });
  });
}

/**
 * Detect if an order is delayed.
 */
export function isOrderDelayed(order: Order): { delayed: boolean; minutesLate: number } {
  if (!order.estimated_ready_time) return { delayed: false, minutesLate: 0 };
  const now = new Date();
  const est = new Date(order.estimated_ready_time);
  const minutesLate = (now.getTime() - est.getTime()) / 60000;
  return { delayed: minutesLate > 5, minutesLate: Math.round(minutesLate) };
}

/**
 * Get a human-readable priority reason for the staff UI.
 */
export function getPriorityReason(order: Order, entry: QueueEntry): string {
  const reasons: string[] = [];
  const now = new Date();

  if (order.pickup_time) {
    const pickup = new Date(order.pickup_time);
    const mins = Math.round((pickup.getTime() - now.getTime()) / 60000);
    if (mins <= 0) reasons.push(`Pickup overdue by ${Math.abs(mins)} min`);
    else if (mins <= 10) reasons.push(`Pickup in ${mins} min`);
  }

  const orderTime = new Date(order.order_time);
  const waitMins = Math.round((now.getTime() - orderTime.getTime()) / 60000);
  if (waitMins > 10) reasons.push(`Waiting ${waitMins} min`);

  if (order.order_status === 'delayed') reasons.push('Marked delayed');

  return reasons.length > 0 ? reasons.join(' · ') : `Score: ${entry.priority_score}`;
}

/**
 * Score label for display.
 */
export function getPriorityLabel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
