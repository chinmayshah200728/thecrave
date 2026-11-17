export type OrderStatus = "received" | "preparing" | "out_for_delivery" | "delivered";
export type PaymentMethod = "cash" | "upi";

export interface OrderItemIn {
  item_id: string;
  qty: number;
}

export interface OrderCreate {
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: PaymentMethod;
  items: OrderItemIn[];
}

export interface OrderItem {
  item_id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface StatusUpdate {
  status: OrderStatus;
}

export interface PinLogin {
  pin: string;
}

export interface KitchenSession {
  authed: boolean;
}

export const STATUS_FLOW: OrderStatus[] = ["received", "preparing", "out_for_delivery", "delivered"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash on delivery",
  upi: "UPI on delivery",
};

export const FREE_DELIVERY_OVER = 500;
export const DELIVERY_FEE = 49;
export const deliveryFee = (subtotal: number) => (subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE);
export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
