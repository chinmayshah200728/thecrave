import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import OrderStatus from "@/pages/OrderStatus";
import Kitchen from "@/pages/Kitchen";
import CartSheet from "@/components/CartSheet";
import CheckoutDialog from "@/components/CheckoutDialog";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order/:id" element={<OrderStatus />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <CartSheet />
      <CheckoutDialog />
      <Toaster theme="dark" position="bottom-right" />
    </CartProvider>
  );
}
