import { DISH_BY_ID } from "@/data/dishes";
import { DELIVERY_FEE, FREE_DELIVERY_OVER, type Order, type OrderCreate, type PaymentMethod, type StatusUpdate } from "@/lib/types";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = any;

const ORDERS_STORAGE_KEY = "fc_orders_db";
const KITCHEN_AUTH_KEY = "fc_kitchen_authed";
let orderCounter = 1001;

function getStoredOrders(): Record<string, Order> {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredOrders(orders: Record<string, Order>) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

// Client-side fallback handler for static hosting previews
function handleClientFallback<T>(method: string, path: string, body?: any): T {
  // GET /kitchen/me
  if (method === "GET" && path === "/kitchen/me") {
    return { authed: localStorage.getItem(KITCHEN_AUTH_KEY) === "true" } as T;
  }

  // POST /kitchen/login
  if (method === "POST" && path === "/kitchen/login") {
    if (body?.pin === "1234") {
      localStorage.setItem(KITCHEN_AUTH_KEY, "true");
      return { authed: true } as T;
    }
    throw new ApiError(401, { detail: "Wrong PIN" });
  }

  // POST /kitchen/logout
  if (method === "POST" && path === "/kitchen/logout") {
    localStorage.removeItem(KITCHEN_AUTH_KEY);
    return { authed: false } as T;
  }

  // GET /kitchen/orders
  if (method === "GET" && path === "/kitchen/orders") {
    const orders = getStoredOrders();
    const list = Object.values(orders).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return list as T;
  }

  // PATCH /kitchen/orders/:id/status
  const patchMatch = path.match(/^\/kitchen\/orders\/([^\/]+)\/status$/);
  if (method === "PATCH" && patchMatch) {
    const orderId = patchMatch[1];
    const orders = getStoredOrders();
    const order = orders[orderId];
    if (!order) throw new ApiError(404, { detail: "Order not found" });
    order.status = (body as StatusUpdate).status;
    order.updated_at = new Date().toISOString();
    saveStoredOrders(orders);
    return order as T;
  }

  // POST /orders
  if (method === "POST" && path === "/orders") {
    const payload = body as OrderCreate;
    const orders = getStoredOrders();
    const count = Object.keys(orders).length;
    let subtotal = 0;
    const orderItems = (payload.items || []).map((it) => {
      const dish = DISH_BY_ID[it.item_id];
      const price = dish?.price || 0;
      subtotal += price * it.qty;
      return {
        item_id: it.item_id,
        name: dish?.name || it.item_id,
        price,
        qty: it.qty,
      };
    });

    const fee = subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE;
    const now = new Date().toISOString();
    const id = "ord_" + Math.random().toString(36).slice(2, 11);
    const order: Order = {
      id,
      order_number: `TFC-${orderCounter + count}`,
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      note: payload.note || "",
      payment_method: payload.payment_method,
      items: orderItems,
      subtotal,
      delivery_fee: fee,
      total: subtotal + fee,
      status: "received",
      created_at: now,
      updated_at: now,
    };

    orders[id] = order;
    saveStoredOrders(orders);
    return order as T;
  }

  // GET /orders/:id
  const getMatch = path.match(/^\/orders\/([^\/]+)$/);
  if (method === "GET" && getMatch) {
    const orderId = getMatch[1];
    const orders = getStoredOrders();
    const order = orders[orderId];
    if (!order) throw new ApiError(404, { detail: "Order not found" });
    return order as T;
  }

  throw new ApiError(404, { detail: "Endpoint not found" });
}

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });

    const contentType = res.headers.get("content-type") || "";
    // If running on a static host where /api returns HTML (fallback to index.html) or 404
    if (!res.ok || !contentType.includes("application/json")) {
      return handleClientFallback<T>(method, path, body);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    // If backend is unreachable or static deployment without backend server
    return handleClientFallback<T>(method, path, body);
  }
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) => request<T>("PATCH", path, body ?? null);
