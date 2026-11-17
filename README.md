# The Fresh Crave · Cinematic Mumbai Cloud Kitchen

An interactive full-stack food ordering application with an interactive 3D Chef mascot (Three.js / React Three Fiber), dynamic kitchen tour, cart, checkout, live order tracking, and a kitchen display board for staff.

---

## Project Structure

```
fresh-crave/
├── backend/
│   ├── server.js          # Fast, zero-dependency Node.js backend (Runs on http://localhost:8001)
│   ├── main.py            # FastAPI implementation (Python)
│   └── requirements.txt   # Python dependencies (fastapi, uvicorn, pydantic)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── components/    # 3D Chef canvas, dish tour, cart drawer, checkout dialog, status tracker
│   │   ├── pages/         # Home, Kitchen (Staff PIN: 1234), OrderStatus
│   │   └── data/          # Signature dishes and menu
└── start.bat              # One-click launcher for Windows
```

---

## How to Run

### Option 1: Quick Start (Node.js)

1. Open PowerShell or Terminal in `fresh-crave`:
   ```powershell
   cd fresh-crave
   ```

2. Start the backend:
   ```powershell
   node backend/server.js
   ```
   *(Backend runs on `http://localhost:8001`)*

3. In a second terminal, start the frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*

4. Open your browser at [http://localhost:5173](http://localhost:5173).

---

### Option 2: Python FastAPI Backend (Alternative)

If you have Python 3 installed:
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

---

## Features
- **Interactive 3D Chef Crave Mascot**: Follows cursor, reacts to scrolling across dish stations, bounces when clicked, and celebrates when dishes are added to cart.
- **Cinematic Kitchen Tour**: Scroll-driven storytelling through 6 signature kitchen stations with culinary photography and notes.
- **Cart & Checkout**: Drawer cart, dynamic delivery fee calculations, and Cash on Delivery / UPI checkout.
- **Live Order Status Tracking**: Real-time progress bar from Received -> Preparing -> Out for delivery -> Delivered.
- **Kitchen Staff Portal (`/kitchen`)**: Protected with PIN `1234`. Real-time kitchen display board with revenue counters, filtering, and one-click order status advancement.
