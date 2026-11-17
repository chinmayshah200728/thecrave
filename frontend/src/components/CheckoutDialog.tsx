import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Banknote, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, ApiError } from "@/lib/api";
import { useCart, LAST_ORDER_KEY } from "@/lib/cart";
import { deliveryFee, formatINR, type Order, type OrderCreate, type PaymentMethod } from "@/lib/types";

const PAYMENTS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash on delivery", icon: Banknote },
  { value: "upi", label: "UPI on delivery", icon: Smartphone },
];

export default function CheckoutDialog() {
  const navigate = useNavigate();
  const { lines, subtotal, clear, checkoutOpen, setCheckoutOpen } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [error, setError] = useState<string | null>(null);
  const total = subtotal + deliveryFee(subtotal);

  const placeOrder = useMutation({
    mutationFn: (body: OrderCreate) => apiPost<Order>("/orders", body),
    onSuccess: (order) => {
      localStorage.setItem(LAST_ORDER_KEY, order.id);
      clear();
      setCheckoutOpen(false);
      setNote("");
      toast.success(`Order ${order.order_number} is on the pass!`);
      navigate(`/order/${order.id}`);
    },
    onError: (err) => {
      setError(err instanceof ApiError && err.status === 422 ? "Please check your details and try again." : "Couldn't place your order. Please try again.");
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(digits)) return setError("Please enter a valid 10-digit mobile number.");
    if (address.trim().length < 8) return setError("Please enter your full delivery address.");
    const items = Object.entries(lines).map(([item_id, qty]) => ({ item_id, qty }));
    if (items.length === 0) return setError("Your cart is empty.");
    placeOrder.mutate({ customer_name: name.trim(), phone: digits, address: address.trim(), note: note.trim(), payment_method: payment, items });
  };

  const field = "border-[#e9b872]/20 bg-[#17130f] text-[#f6eee3] placeholder:text-[#c4b5a5]/50 focus-visible:border-[#e9b872]/60";

  return (
    <Dialog open={checkoutOpen} onOpenChange={(o: boolean) => setCheckoutOpen(o)}>
      <DialogContent className="max-h-[92svh] overflow-y-auto border border-[#e9b872]/15 bg-[#1b1611] sm:max-w-lg" data-testid="checkout-dialog">
        <DialogHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e9b872]">Checkout · {formatINR(total)}</p>
          <DialogTitle className="font-heading text-3xl font-normal text-[#f6eee3]">Where should we bring it?</DialogTitle>
          <DialogDescription className="text-[#c4b5a5]">No online payment — settle up when it reaches your door.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-4" data-testid="checkout-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="co-name" className="text-[#c4b5a5]">Name</Label>
              <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aanya Mehta" className={field} data-testid="checkout-name-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-phone" className="text-[#c4b5a5]">Phone</Label>
              <Input
                id="co-phone"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className={field}
                data-testid="checkout-phone-input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-address" className="text-[#c4b5a5]">Delivery address</Label>
            <Textarea
              id="co-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat, building, street, area, pin code"
              rows={3}
              className={field}
              data-testid="checkout-address-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-note" className="text-[#c4b5a5]">Note for the kitchen (optional)</Label>
            <Input id="co-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Less spicy, ring the bell twice…" className={field} data-testid="checkout-note-input" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-[#c4b5a5]">Payment</p>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENTS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayment(value)}
                  aria-pressed={payment === value}
                  className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm transition-[border-color,background-color] duration-200 ${
                    payment === value ? "border-[#e9b872] bg-[#2d2319] text-[#f6eee3]" : "border-[#e9b872]/15 text-[#c4b5a5] hover:border-[#e9b872]/40"
                  }`}
                  data-testid={`checkout-payment-${value}`}
                >
                  <Icon className="size-4 text-[#e9b872]" /> {label}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-3 py-2 text-sm text-[#ff9b94]" data-testid="checkout-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={placeOrder.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c8664a] py-4 text-[15px] font-medium text-white transition-[background-color,opacity] duration-200 hover:bg-[#d9775c] disabled:opacity-60"
            data-testid="checkout-submit-btn"
          >
            {placeOrder.isPending && <Loader2 className="size-4 animate-spin" />}
            Place order · {formatINR(total)}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
