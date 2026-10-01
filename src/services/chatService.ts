/**
 * FataFat Food AI Assistant
 *
 * Strategy:
 *  1. If VITE_CHATBOT_KEY is a valid OpenRouter key (starts with "sk-or-v1-"),
 *     use the OpenRouter API (meta-llama/llama-3.3-70b-instruct:free).
 *  2. Otherwise fall back to the built-in local knowledge base — instant,
 *     no network required, covers every FataFat Food topic.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
export const QUICK_SUGGESTIONS = [
  'How do I place an order?',
  'What is a digital token?',
  'How do I track my order?',
  'Can I cancel my order?',
  'What are the demo accounts?',
  'How does pickup scheduling work?',
  'What does "Preparing" mean?',
  'How do staff verify tokens?',
];

// ── OpenRouter config ─────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'openrouter/free';
const RAW_KEY        = (import.meta.env.VITE_CHATBOT_KEY as string | undefined) ?? '';
const USE_API        = RAW_KEY.startsWith('sk-or-v1-');

// ── System prompt (used when API is available) ────────────────────────────────
const SYSTEM_PROMPT = `You are the FataFat Food AI Assistant — a friendly, concise helper inside the FataFat Food Pre-Order & Digital Queue Management System.

Only answer questions about FataFat Food. If asked anything unrelated respond ONLY with: "I'm here to help with FataFat Food only. Please ask me anything about ordering food, tracking your order, menu items, or how the system works."

ABOUT FataFat Food:
- Customers browse menu, add to cart, pre-order, choose pickup time, get a digital token (e.g. C-023) and QR code, track order live, collect food.
- Order statuses: Placed → Accepted → Preparing → Ready → Collected → Completed. Also: Cancelled, Rejected, Delayed, Not Collected.
- Staff accept/reject orders, manage kitchen queue by smart priority, mark ready, verify tokens at collection.
- Managers manage menu, pickup slots, view analytics and AI insights.
- Admins manage users, roles, categories, system logs.
- Demo accounts: customer@demo.com/customer123, staff@demo.com/staff123, manager@demo.com/manager123, admin@demo.com/admin123.
- Pickup slots are 15-min windows with capacity limits. Full slots are disabled.
- Token format: C-XXX. Show token or QR code at counter to collect food.
- Smart queue priority considers pickup urgency, lateness, waiting time, prep complexity.
- Prep time is dynamic: based on slowest item + quantity + kitchen workload.

Keep answers short, friendly, use bullet points for steps. Never make up info not above.`;

// ── LOCAL KNOWLEDGE BASE ──────────────────────────────────────────────────────
interface KBEntry {
  patterns: RegExp[];
  answer: string;
}

const KNOWLEDGE_BASE: KBEntry[] = [
  {
    patterns: [/place.+order|how.+order|start.+order|make.+order|order.+food/i],
    answer: `Here's how to place an order:\n\n1. Go to the **Menu** page\n2. Browse items and tap **Add to Cart**\n3. Set quantity and add any special instructions\n4. Open your **Cart** and review items\n5. Tap **Proceed to Checkout**\n6. Select a pickup time slot\n7. Confirm and tap **Place Order**\n8. You'll receive your **digital token** instantly!`,
  },
  {
    patterns: [/digital token|what is.*token|token.*mean|token.*work|c-0\d\d/i],
    answer: `A **digital token** (e.g. C-023) is your unique order identifier.\n\n- You receive it immediately after placing an order\n- A **QR code** is also generated with it\n- Show either the token number or QR code at the counter when collecting\n- It prevents anyone else from picking up your order\n- Each order gets exactly one token — no duplicates`,
  },
  {
    patterns: [/track.*order|order.*status|where.*order|check.*order|live.*status/i],
    answer: `To track your order:\n\n1. Go to **My Orders** in the navigation\n2. Tap **Track** on any active order\n3. You'll see a live status timeline:\n   - ✅ Placed → Accepted → Preparing → Ready → Collected\n\nYou also receive **in-app notifications** and **email updates** at every step.\n\nThe page auto-refreshes every 5 seconds!`,
  },
  {
    patterns: [/cancel.*order|order.*cancel/i],
    answer: `You can cancel an order **only before preparation begins**.\n\n✅ Can cancel when status is: **Placed** or **Accepted**\n❌ Cannot cancel once status is: **Preparing**, **Ready**, or beyond\n\nTo cancel:\n1. Go to **My Orders** → tap **Track**\n2. Scroll down and tap **Cancel Order**\n\nA refund will be processed and you'll receive a cancellation email.`,
  },
  {
    patterns: [/demo.*account|test.*account|login.*demo|demo.*login|sample.*account/i],
    answer: `**Demo accounts for testing:**\n\n- 👤 Customer: \`customer@demo.com\` / \`customer123\`\n- 👨‍🍳 Staff: \`staff@demo.com\` / \`staff123\`\n- 📊 Manager: \`manager@demo.com\` / \`manager123\`\n- 🔐 Admin: \`admin@demo.com\` / \`admin123\`\n\nAll accounts are pre-loaded with demo data including orders, queue entries, and notifications.`,
  },
  {
    patterns: [/pickup.*slot|slot.*pickup|pickup.*time|schedule.*pickup|time.*slot/i],
    answer: `**Pickup Slots** are 15-minute collection windows (e.g. 12:00–12:15).\n\n- Each slot has a **maximum capacity** (e.g. 20 orders)\n- When a slot is **80% full** it shows ⚡ Filling Up\n- When **100% full** it shows ⛔ FULL and is disabled\n- The system auto-schedules prep so food is ready close to your slot\n- Managers can add/edit slots in the Manager Portal`,
  },
  {
    patterns: [/preparing.*mean|what.*preparing|status.*preparing|preparing.*status/i],
    answer: `**Preparing** means the kitchen has started cooking your food! 🔥\n\nFull order lifecycle:\n1. **Placed** — order submitted, waiting for kitchen\n2. **Accepted** — kitchen acknowledged your order\n3. **Preparing** — food is being cooked right now\n4. **Ready** — food is done, head to the counter!\n5. **Collected** — you've picked up your food\n6. **Completed** — order fully done\n\nYou'll get notified at each step via in-app notification and email.`,
  },
  {
    patterns: [/staff.*verif|verif.*token|collect.*verif|verif.*collect|scan.*qr|qr.*scan/i],
    answer: `**Token verification by staff:**\n\n1. Staff opens the **Verify Token** screen (\`/staff/verify\`)\n2. Customer shows their **token number** (e.g. C-023) or **QR code**\n3. Staff enters the token and taps **Verify**\n4. The system checks the order is **Ready** and not already collected\n5. Staff taps **Confirm Collection**\n6. Order status moves to **Collected → Completed**\n\nDouble-collection is prevented — each token can only be collected once.`,
  },
  {
    patterns: [/manager.*dashboard|dashboard.*manager|analytics|sales.*report|report/i],
    answer: `The **Manager Dashboard** shows:\n\n- 📦 Total orders today, active, preparing, ready, completed, cancelled\n- 💰 Total sales and average prep time\n- 📈 Sales chart (last 14 days)\n- ⏰ Orders by hour (peak time analysis)\n- 🏆 Most popular items\n- 📍 Pickup slot utilization\n- 🤖 AI-powered insights (demand prediction, delay risk, waste alerts)\n\nAccess it at \`/manager/dashboard\` using the Manager account.`,
  },
  {
    patterns: [/staff.*dashboard|kitchen.*queue|queue.*kitchen|kitchen.*screen/i],
    answer: `The **Kitchen Queue** (\`/staff/queue\`) shows all active orders sorted by smart priority.\n\n**Tabs:** New | Accepted | Preparing | Ready | Delayed\n\nEach order card shows:\n- Token number, items, special instructions\n- Priority score (HIGH / MEDIUM / LOW)\n- Pickup time, estimated ready time\n- Delay warnings ⚠️\n\n**Actions:** Accept → Start Preparing → Mark Ready → Verify Collection`,
  },
  {
    patterns: [/admin.*panel|admin.*dashboard|user.*manag|manag.*user/i],
    answer: `The **Admin Panel** (\`/admin\`) provides:\n\n- 👥 **User Management** — create, edit, suspend users, assign roles\n- 🏷️ **Category Management** — add/edit/delete menu categories\n- 📋 **System Logs** — full staff activity history\n- 📊 **Dashboard** — user counts by role, recent activity\n\nLogin with \`admin@demo.com\` / \`admin123\``,
  },
  {
    patterns: [/menu.*manag|manag.*menu|add.*item|edit.*item|delete.*item/i],
    answer: `Managers can manage the menu at \`/manager/menu\`:\n\n- ➕ **Add items** — name, category, price, quantity, prep time, image\n- ✏️ **Edit items** — update any field including stock\n- 🔄 **Toggle availability** — instantly mark items available/unavailable\n- 🗑️ **Delete items** — remove permanently\n- Stock changes auto-update status: Available → Limited (≤10) → Sold Out (0)`,
  },
  {
    patterns: [/sold.?out|unavailabl|not available|limited/i],
    answer: `**Item availability statuses:**\n\n- 🟢 **Available** — in stock, can be ordered\n- 🟡 **Limited** — 10 or fewer remaining\n- 🔴 **Sold Out** — stock reached 0, cannot be ordered\n- ⛔ **Temporarily Unavailable** — disabled by staff\n\nWhen you add an item to cart, stock is validated. Sold-out items are greyed out on the menu page.`,
  },
  {
    patterns: [/notification|email.*notif|notif.*email|alert/i],
    answer: `**Notifications in FataFat Food:**\n\n📱 **In-app notifications** (bell icon in nav):\n- Order accepted, preparing, ready, delayed, cancelled\n\n📧 **Email notifications** (via EmailJS):\n- Order confirmation with token\n- Preparation started\n- Order ready for pickup\n- Delay alert\n- Cancellation / rejection\n- Completion receipt\n\nAll emails are sent automatically — check your inbox after ordering!`,
  },
  {
    patterns: [/reorder|order.+again|previous.+order/i],
    answer: `To **reorder** a previous meal:\n\n1. Go to **My Orders** in the navigation\n2. Find the past order\n3. Tap **Reorder**\n4. Available items are added to your cart automatically\n5. If any item is now sold out, you'll be notified which ones were skipped\n\nThen proceed to checkout as normal!`,
  },
  {
    patterns: [/special.*instruct|instruct.*special|note.*food|food.*note|customiz/i],
    answer: `You can add **special instructions** for each item:\n\n1. Add the item to your cart\n2. In the **Cart** page, tap the message icon under each item\n3. Type your instruction (e.g. "Extra sauce", "No pickles", "Less spicy")\n4. Press Enter or click away to save\n\nInstructions are visible to kitchen staff on every order card.`,
  },
  {
    patterns: [/priority.*queue|queue.*priority|smart.*queue|priority.*score/i],
    answer: `**Smart Queue Priority** scores orders 0–100:\n\n- 🔴 **HIGH (70–100)** — pickup very soon or already overdue\n- 🟡 **MEDIUM (40–69)** — approaching pickup time\n- 🟢 **LOW (0–39)** — plenty of time remaining\n\nScore formula:\n- 40% — lateness (past estimated ready time)\n- 30% — pickup urgency (time until pickup)\n- 20% — waiting time (how long order has been placed)\n- 10% — preparation complexity\n\nStaff see the reason shown on every order card.`,
  },
  {
    patterns: [/prep.*time|preparation.*time|how.*long|wait.*time|ready.*when/i],
    answer: `**Preparation time** is estimated dynamically:\n\n- Based on the **slowest item** in your order\n- Plus extra time for large quantities\n- Multiplied by a **kitchen workload factor** (more active orders = longer wait)\n\nExample: 8 active orders → workload factor 1.8×\n\nThe estimate updates automatically as kitchen load changes and is shown at checkout, on the confirmation screen, and in order tracking.`,
  },
  {
    patterns: [/delayed|delay/i],
    answer: `An order is marked **Delayed** when:\n\n- It has exceeded its estimated ready time by more than 5 minutes\n- Staff manually marks it delayed due to kitchen issues\n\nWhen delayed:\n- ⚠️ Warning shown on the kitchen queue\n- Customer receives a delay notification (in-app + email)\n- Priority score is boosted so staff focus on it\n\nStaff can resume preparation or mark it ready from the Delayed tab.`,
  },
  {
    patterns: [/sign.?up|register|create.*account|new.*account/i],
    answer: `To **create an account**:\n\n1. Go to the login page and click **Sign up**\n2. Enter your full name, email, and password (min. 6 characters)\n3. Click **Create Account**\n4. You'll be logged in automatically as a Customer\n5. A welcome email will be sent to your address\n\nAll new registrations default to the **Customer** role. Admins can upgrade roles later.`,
  },
  {
    patterns: [/qr.?code|scan|barcode/i],
    answer: `**QR codes** in FataFat Food:\n\n- Generated automatically with every order\n- Contains a secure reference to your token + order ID\n- Shown on the **Order Confirmation** and **Order Tracking** pages\n- Tap "Show QR Code" on the tracking page anytime\n- Staff scan or manually enter the token at the collection counter\n- Each QR code can only be used once`,
  },
  {
    patterns: [/payment|pay|price|cost|how much/i],
    answer: `**Payment in FataFat Food:**\n\n- Payment is handled **at the counter** (cash or card)\n- The system records payment status: Pending → Paid\n- Total is shown clearly at checkout and on your token screen\n- No online payment credentials required for the demo\n- Prices are set by the Manager in the menu management panel`,
  },
  {
    patterns: [/hello|hi|hey|good morning|good afternoon|good evening|howdy/i],
    answer: `Hello! 👋 Welcome to the **FataFat Food Assistant**!\n\nI can help you with:\n- 🍔 Placing and tracking orders\n- 🎫 Understanding tokens & QR codes\n- ⏰ Pickup slots and scheduling\n- 👨‍🍳 Staff and kitchen queue features\n- 📊 Manager analytics and reports\n- 🔐 Demo accounts and login help\n\nWhat would you like to know?`,
  },
  {
    patterns: [/thank|thanks|great|awesome|perfect|helpful/i],
    answer: `You're welcome! 😊 Is there anything else I can help you with about FataFat Food?\n\nFeel free to ask about ordering, tokens, the kitchen queue, or any feature of the system.`,
  },
  {
    patterns: [/help|what can you do|what do you know|capabilities/i],
    answer: `I can answer questions about **FataFat Food** including:\n\n- 🛒 How to browse, order, and checkout\n- 🎫 Digital tokens and QR codes\n- 📍 Pickup time slots\n- 📦 Order statuses and tracking\n- 🔔 Notifications (in-app + email)\n- 👨‍🍳 Staff kitchen queue and token verification\n- 📊 Manager dashboard and analytics\n- 🔐 Admin user management\n- 🤖 AI insights and smart queue priority\n- 🧪 Demo accounts for testing\n\nJust ask!`,
  },
];

// ── Fallback response ─────────────────────────────────────────────────────────
const OFF_TOPIC_RESPONSE =
  "I'm here to help with **FataFat Food** only. Please ask me anything about ordering food, tracking your order, menu items, pickup slots, tokens, or how the system works. 😊";

const UNKNOWN_RESPONSE =
  "I don't have a specific answer for that, but I'm happy to help with any **FataFat Food** question!\n\nTry asking about:\n- How to place an order\n- Digital tokens and QR codes\n- Order tracking and statuses\n- Pickup scheduling\n- Demo accounts\n- Staff or manager features";

// ── Off-topic detector ────────────────────────────────────────────────────────
const OFF_TOPIC_PATTERNS = [
  /weather|temperature|forecast/i,
  /news|politics|government|election/i,
  /sport|cricket|football|soccer/i,
  /stock|crypto|bitcoin|invest/i,
  /recipe|how.+cook|cooking.*tip/i,
  /movie|film|series|netflix/i,
  /write.*code|debug|programming|javascript|python|react/i,
  /who.*president|who.*prime.*minister/i,
  /capital.*of|geography|history.*of/i,
  /joke|tell.*story|poem/i,
  /chatgpt|openai|google|microsoft|apple/i,
  /whatsapp|instagram|facebook|twitter/i,
];

function isOffTopic(text: string): boolean {
  return OFF_TOPIC_PATTERNS.some((p) => p.test(text));
}

// ── Local response engine ─────────────────────────────────────────────────────
function localResponse(userMessage: string): string {
  if (isOffTopic(userMessage)) return OFF_TOPIC_RESPONSE;

  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some((p) => p.test(userMessage))) {
      return entry.answer;
    }
  }

  // Keyword fallback search
  const lower = userMessage.toLowerCase();
  if (lower.includes('order'))       return KNOWLEDGE_BASE[0].answer;
  if (lower.includes('token'))       return KNOWLEDGE_BASE[1].answer;
  if (lower.includes('track'))       return KNOWLEDGE_BASE[2].answer;
  if (lower.includes('cancel'))      return KNOWLEDGE_BASE[3].answer;
  if (lower.includes('pickup'))      return KNOWLEDGE_BASE[5].answer;
  if (lower.includes('staff'))       return KNOWLEDGE_BASE[9].answer;
  if (lower.includes('manager'))     return KNOWLEDGE_BASE[8].answer;
  if (lower.includes('admin'))       return KNOWLEDGE_BASE[10].answer;
  if (lower.includes('notification'))return KNOWLEDGE_BASE[13].answer;
  if (lower.includes('queue'))       return KNOWLEDGE_BASE[15].answer;

  return UNKNOWN_RESPONSE;
}

// ── Main send function ────────────────────────────────────────────────────────
export async function sendChatMessage(
  history: ChatMessage[],
  userMessage: string,
  signal?: AbortSignal,
): Promise<string> {
  // ── Use local engine if no valid key ──────────────────────────────────
  if (!USE_API) {
    // Simulate a small think delay so it feels natural
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return localResponse(userMessage);
  }

  // ── OpenRouter API path ───────────────────────────────────────────────
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
      .filter((m) => !m.isLoading && !m.isError && m.role !== 'system')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal,
      headers: {
        Authorization:  `Bearer ${RAW_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fatafat-food.app',
        'X-Title':      'FataFat Food Assistant',
      },
      body: JSON.stringify({
        model:       MODEL,
        messages:    apiMessages,
        max_tokens:  512,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      console.debug(`[ChatBot] API status ${res.status} — using local engine`);
      return localResponse(userMessage);
    }

    const data    = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return localResponse(userMessage);
    return content.trim();
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    console.debug('[ChatBot] Network fallback to local engine', err);
    return localResponse(userMessage);
  }
}

