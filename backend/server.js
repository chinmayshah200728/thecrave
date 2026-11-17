import http from "node:http";
import crypto from "node:crypto";

const MENU = {
  "avocado-toast": { name: "Sourdough Avocado Toast", price: 380 },
  "harvest-bowl": { name: "Emerald Harvest Bowl", price: 420 },
  "emerald-arborio": { name: "Emerald Arborio", price: 540 },
  "carrot-veloute": { name: "Roasted Carrot & Ginger Velouté", price: 340 },
  "coconut-cooler": { name: "Coconut Espresso Cooler", price: 280 },
  "pistachio-affogato": { name: "Pistachio Affogato", price: 320 },
  "masala-chai": { name: "Kulhad Masala Chai", price: 120 },
  "truffle-fries": { name: "Rosemary Truffle Fries", price: 190 },
  "berry-parfait": { name: "Berry Granola Parfait", price: 240 },
};

const FREE_DELIVERY_OVER = 500;
const DELIVERY_FEE = 49;
const KITCHEN_PIN = "1234";
const SESSION_COOKIE_NAME = "kitchen_session";

const ordersDb = new Map();
let orderCounter = 1001;

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURI(parts.join("="));
  });
  return list;
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    ...headers,
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    });
    return res.end();
  }

  // Helper to read JSON body
  const readBody = () =>
    new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
    });

  // GET /api/kitchen/me
  if (method === "GET" && pathname === "/api/kitchen/me") {
    const cookies = parseCookies(req);
    return sendJson(res, 200, {
      authed: cookies[SESSION_COOKIE_NAME] === "authed_kitchen_session",
    });
  }

  // POST /api/kitchen/login
  if (method === "POST" && pathname === "/api/kitchen/login") {
    const body = await readBody();
    if (body.pin === KITCHEN_PIN) {
      return sendJson(
        res,
        200,
        { authed: true },
        {
          "Set-Cookie": `${SESSION_COOKIE_NAME}=authed_kitchen_session; Path=/; HttpOnly; SameSite=Lax`,
        }
      );
    }
    return sendJson(res, 401, { detail: "Wrong PIN" });
  }

  // POST /api/kitchen/logout
  if (method === "POST" && pathname === "/api/kitchen/logout") {
    return sendJson(
      res,
      200,
      { authed: false },
      {
        "Set-Cookie": `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      }
    );
  }

  // GET /api/kitchen/orders
  if (method === "GET" && pathname === "/api/kitchen/orders") {
    const cookies = parseCookies(req);
    if (cookies[SESSION_COOKIE_NAME] !== "authed_kitchen_session") {
      return sendJson(res, 401, { detail: "Kitchen PIN required" });
    }
    const all = Array.from(ordersDb.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return sendJson(res, 200, all);
  }

  // PATCH /api/kitchen/orders/:id/status
  const patchStatusMatch = pathname.match(/^\/api\/kitchen\/orders\/([^\/]+)\/status$/);
  if (method === "PATCH" && patchStatusMatch) {
    const cookies = parseCookies(req);
    if (cookies[SESSION_COOKIE_NAME] !== "authed_kitchen_session") {
      return sendJson(res, 401, { detail: "Kitchen PIN required" });
    }
    const orderId = patchStatusMatch[1];
    const order = ordersDb.get(orderId);
    if (!order) return sendJson(res, 404, { detail: "Order not found" });
    const body = await readBody();
    order.status = body.status;
    order.updated_at = new Date().toISOString();
    return sendJson(res, 200, order);
  }

  // POST /api/orders
  if (method === "POST" && pathname === "/api/orders") {
    const payload = await readBody();
    const orderItems = [];
    let subtotal = 0;

    for (const item of payload.items || []) {
      const dish = MENU[item.item_id];
      if (!dish) return sendJson(res, 400, { detail: `Unknown item ${item.item_id}` });
      orderItems.push({
        item_id: item.item_id,
        name: dish.name,
        price: dish.price,
        qty: item.qty,
      });
      subtotal += dish.price * item.qty;
    }

    const deliveryFee =
      subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const orderNumber = `TFC-${orderCounter++}`;

    const order = {
      id: orderId,
      order_number: orderNumber,
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      note: payload.note || "",
      payment_method: payload.payment_method,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      status: "received",
      created_at: now,
      updated_at: now,
    };

    ordersDb.set(orderId, order);
    return sendJson(res, 200, order);
  }

  // GET /api/orders/:id
  const getOrderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
  if (method === "GET" && getOrderMatch) {
    const orderId = getOrderMatch[1];
    const order = ordersDb.get(orderId);
    if (!order) return sendJson(res, 404, { detail: "Order not found" });
    return sendJson(res, 200, order);
  }

  return sendJson(res, 404, { detail: "Not found" });
});

server.listen(8001, () => {
  console.log("The Fresh Crave backend listening on http://localhost:8001");
});
