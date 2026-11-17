import { ArrowRight, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DISH_BY_ID } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { FREE_DELIVERY_OVER, deliveryFee, formatINR } from "@/lib/types";
import QtyStepper from "@/components/QtyStepper";

export default function CartSheet() {
  const { lines, setQty, subtotal, count, cartOpen, setCartOpen, setCheckoutOpen } = useCart();
  const fee = deliveryFee(subtotal);
  const entries = Object.entries(lines);

  return (
    <Sheet open={cartOpen} onOpenChange={(o: boolean) => setCartOpen(o)}>
      <SheetContent side="right" className="w-full border-l border-[#e9b872]/15 bg-[#1b1611] sm:max-w-md" data-testid="cart-drawer">
        <SheetHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e9b872]">The order pass</p>
          <SheetTitle className="font-heading text-3xl font-normal text-[#f6eee3]">Your order</SheetTitle>
          <SheetDescription className="text-[#c4b5a5]">
            {count === 0 ? "Nothing on the pass yet." : `${count} ${count === 1 ? "item" : "items"}, cooked fresh when you order.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center" data-testid="cart-empty-state">
              <ShoppingBag className="size-10 text-[#e9b872]/50" strokeWidth={1.2} />
              <p className="mt-4 text-sm text-[#c4b5a5]">Add a craving from the menu to get started.</p>
              <a
                href="/#menu"
                onClick={() => setCartOpen(false)}
                className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#e9b872] underline-offset-4 hover:underline"
                data-testid="cart-browse-menu-link"
              >
                Browse the menu
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-[#e9b872]/10">
              {entries.map(([id, qty]) => {
                const dish = DISH_BY_ID[id];
                if (!dish) return null;
                return (
                  <li key={id} className="flex items-center gap-4 py-4" data-testid={`cart-line-${id}`}>
                    <img src={dish.image} alt="" className="size-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#f6eee3]">{dish.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-[#c4b5a5]">{formatINR(dish.price * qty)}</p>
                    </div>
                    <QtyStepper qty={qty} onChange={(q) => setQty(id, q)} testId={`cart-${id}`} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-[#e9b872]/15 p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-[#c4b5a5]">
                <dt>Subtotal</dt>
                <dd data-testid="cart-subtotal">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-[#c4b5a5]">
                <dt>Delivery</dt>
                <dd data-testid="cart-delivery-fee">{fee === 0 ? "Free" : formatINR(fee)}</dd>
              </div>
              {fee > 0 && (
                <p className="text-xs text-[#e9b872]/80">Add {formatINR(FREE_DELIVERY_OVER - subtotal)} more for free delivery.</p>
              )}
              <div className="flex justify-between pt-2 font-heading text-2xl text-[#f6eee3]">
                <dt>Total</dt>
                <dd data-testid="cart-total">{formatINR(subtotal + fee)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#c8664a] py-4 text-[15px] font-medium text-white transition-[background-color] duration-200 hover:bg-[#d9775c]"
              data-testid="cart-checkout-btn"
            >
              Proceed to checkout <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
