/**
 * EmailJS Integration — FataFat Food
 *
 * Service ID  : service_12vbsu8
 * Template ID : template-oc9md9o
 * Public Key  : sHfkiQbwxK6XDHAQH
 *
 * The single EmailJS template handles every notification type via
 * a `notification_type` variable so you only need one template.
 *
 * Required template variables (set these in your EmailJS template):
 *   {{to_name}}           – recipient's display name
 *   {{to_email}}          – recipient's email address
 *   {{notification_type}} – e.g. "Order Confirmed", "Order Ready"
 *   {{token_number}}      – e.g. C-023
 *   {{order_id}}          – short order reference
 *   {{order_items}}       – multiline list of items
 *   {{total_amount}}      – formatted total, e.g. Rs. 850
 *   {{pickup_time}}       – formatted pickup time or "ASAP"
 *   {{estimated_ready}}   – formatted estimated ready time
 *   {{message_body}}      – full human-readable message paragraph
 *   {{canteen_name}}      – "FataFat Food" (branding)
 *   {{year}}              – current year for footer
 */

import emailjs from '@emailjs/browser';
import type { Order, User } from '../types';

// ── Credentials ──────────────────────────────────────────────────────────────
const SERVICE_ID  = 'service_12vbsu8';
const TEMPLATE_ID = 'template-oc9md9o';
const PUBLIC_KEY  = 'sHfkiQbwxK6XDHAQH';

// ── Initialise once (idempotent) ──────────────────────────────────────────────
let _initialised = false;
export function initEmailJS(): void {
  if (_initialised) return;
  emailjs.init({ publicKey: PUBLIC_KEY });
  _initialised = true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

function fmtTime(iso?: string): string {
  if (!iso) return 'ASAP';
  return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}

function itemsList(order: Order): string {
  return order.items
    .map((i) => `${i.menu_item?.name ?? 'Item'} × ${i.quantity} — ${fmt(i.price * i.quantity)}`)
    .join('\n');
}

// ── Core send function ────────────────────────────────────────────────────────
async function send(params: Record<string, string>): Promise<void> {
  initEmailJS();
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      canteen_name: 'FataFat Food',
      year: String(new Date().getFullYear()),
      ...params,
    });
  } catch (err) {
    // Non-fatal — log but never crash the app
    console.warn('[EmailJS] Failed to send email:', err);
  }
}

// ── Public email senders ──────────────────────────────────────────────────────

/** Welcome email after a new user registers */
export async function sendWelcomeEmail(user: User): Promise<void> {
  await send({
    to_name:           user.name,
    to_email:          user.email,
    notification_type: 'Welcome to FataFat Food 🎉',
    token_number:      '—',
    order_id:          '—',
    order_items:       '—',
    total_amount:      '—',
    pickup_time:       '—',
    estimated_ready:   '—',
    message_body:
      `Hi ${user.name},\n\nWelcome to FataFat Food! Your account has been created successfully.\n\n` +
      `You can now browse the menu, pre-order your favourite meals, get a digital token, and skip the queue.\n\n` +
      `Log in at any time to start ordering.\n\nEnjoy your meals!`,
  });
}

/** Confirmation email right after an order is placed */
export async function sendOrderConfirmationEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '✅ Order Confirmed',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   fmtTime(order.estimated_ready_time),
    message_body:
      `Hi ${customer.name},\n\nYour order has been placed successfully! 🎉\n\n` +
      `Your digital token is: ${order.token_number}\n` +
      `Estimated ready: ${fmtTime(order.estimated_ready_time)}\n` +
      `Pickup time: ${fmtTime(order.pickup_time)}\n\n` +
      `Please show your token or QR code at the collection counter when your order is ready.\n\nThank you for using FataFat Food!`,
  });
}

/** Email when staff accepts the order */
export async function sendOrderAcceptedEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '👨‍🍳 Order Accepted',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   fmtTime(order.estimated_ready_time),
    message_body:
      `Hi ${customer.name},\n\nGreat news! The kitchen has accepted your order ${order.token_number}.\n\n` +
      `Preparation will begin shortly. Estimated ready time: ${fmtTime(order.estimated_ready_time)}\n\n` +
      `We'll notify you when your food is ready for pickup.`,
  });
}

/** Email when kitchen starts preparing */
export async function sendOrderPreparingEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '🔥 Preparation Started',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   fmtTime(order.estimated_ready_time),
    message_body:
      `Hi ${customer.name},\n\nThe kitchen has started preparing your order ${order.token_number}! 🔥\n\n` +
      `Estimated ready: ${fmtTime(order.estimated_ready_time)}\n` +
      `Pickup: ${fmtTime(order.pickup_time)}\n\n` +
      `We'll send you another email the moment it's ready.`,
  });
}

/** Email when order is ready for collection */
export async function sendOrderReadyEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '🔔 Your Order is Ready!',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   fmtTime(order.estimated_ready_time),
    message_body:
      `Hi ${customer.name},\n\n🎉 Your order ${order.token_number} is READY for pickup!\n\n` +
      `Please head to the collection counter and show your token: ${order.token_number}\n\n` +
      `Items ordered:\n${itemsList(order)}\n\n` +
      `Total: ${fmt(order.total_amount)}\n\n` +
      `Don't forget — uncollected orders are held for 30 minutes. See you soon!`,
  });
}

/** Email when order is delayed */
export async function sendOrderDelayedEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '⚠️ Order Delayed',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   'Updating soon…',
    message_body:
      `Hi ${customer.name},\n\nWe sincerely apologise — your order ${order.token_number} is taking a little longer than expected. ⚠️\n\n` +
      `Our kitchen is working hard and you'll receive an email the moment your order is ready.\n\n` +
      `We appreciate your patience!`,
  });
}

/** Email when order is cancelled */
export async function sendOrderCancelledEmail(order: Order, customer: User, reason?: string): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '❌ Order Cancelled',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       '—',
    estimated_ready:   '—',
    message_body:
      `Hi ${customer.name},\n\nYour order ${order.token_number} has been cancelled.\n\n` +
      (reason ? `Reason: ${reason}\n\n` : '') +
      `Total: ${fmt(order.total_amount)}\n\n` +
      `If you have any questions please speak to canteen staff.\n\nWe hope to see you again soon!`,
  });
}

/** Email when order is rejected by staff */
export async function sendOrderRejectedEmail(order: Order, customer: User, reason?: string): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '🚫 Order Rejected',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       '—',
    estimated_ready:   '—',
    message_body:
      `Hi ${customer.name},\n\nUnfortunately your order ${order.token_number} could not be fulfilled by the kitchen.\n\n` +
      (reason ? `Reason: ${reason}\n\n` : '') +
      `Please visit the canteen to place a new order or speak to a staff member for assistance.\n\nSorry for the inconvenience!`,
  });
}

/** Email when order is collected/completed */
export async function sendOrderCompletedEmail(order: Order, customer: User): Promise<void> {
  await send({
    to_name:           customer.name,
    to_email:          customer.email,
    notification_type: '🎉 Order Completed',
    token_number:      order.token_number,
    order_id:          order.id.slice(-8).toUpperCase(),
    order_items:       itemsList(order),
    total_amount:      fmt(order.total_amount),
    pickup_time:       fmtTime(order.pickup_time),
    estimated_ready:   fmtTime(order.actual_ready_time),
    message_body:
      `Hi ${customer.name},\n\nThank you! Your order ${order.token_number} has been collected and completed. ✅\n\n` +
      `Items:\n${itemsList(order)}\n\n` +
      `Total paid: ${fmt(order.total_amount)}\n\n` +
      `We hope you enjoy your meal. Come back soon! 😊`,
  });
}

