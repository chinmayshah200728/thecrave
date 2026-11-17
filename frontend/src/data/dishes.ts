const IMG = "https://static.prod-images.emergentagent.com/jobs/e14c4bbe-3764-4ab3-821e-d6a1f0291e0a/images";

export const HERO_IMAGE = `${IMG}/a09e65a58b8c85243429662f95876beb4d7a0ae7e9403d9ed8cda00b54efea2d.jpeg`;

export type Category = "Signature" | "Sides & Sips";

export interface Dish {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  blurb: string;
  tags: string[];
  station?: string;
  story?: string;
  chefLine?: string;
}

export const DISHES: Dish[] = [
  {
    id: "avocado-toast",
    name: "Sourdough Avocado Toast",
    price: 380,
    image: `${IMG}/6742e44b3fa4b057376a2884238426a55612a9e06c861be0faee0d5d284c585e.jpeg`,
    category: "Signature",
    blurb: "Silky avocado, a soft egg and a bright chilli finish on toasted sourdough.",
    tags: ["Breakfast", "Vegetarian"],
    station: "The Breakfast Window",
    story: "Silky avocado, a soft egg, garden greens and a bright chilli finish on toasted sourdough.",
    chefLine: "Crisped on the cast-iron at dawn — squeeze that lemon!",
  },
  {
    id: "harvest-bowl",
    name: "Emerald Harvest Bowl",
    price: 420,
    image: `${IMG}/ba3a23edbadbf30531c1b8ed8c9483c452c4b03af3b07bf8ecd0a61107a1c3d4.jpeg`,
    category: "Signature",
    blurb: "Roasted seasonal vegetables, greens, grains, hummus and citrus.",
    tags: ["Vegan", "High protein"],
    station: "The Greens Counter",
    story: "Roasted seasonal vegetables, greens, grains, hummus and citrus in a bowl that eats like sunshine.",
    chefLine: "Greens picked this morning. Sunshine, but make it a bowl.",
  },
  {
    id: "emerald-arborio",
    name: "Emerald Arborio",
    price: 540,
    image: `${IMG}/4fa735963cfd230a9160eba2cf277a1bb20d60fc101dc79f7695887e8c15be30.jpeg`,
    category: "Signature",
    blurb: "Creamy arborio folded with greens, herbs and parmesan.",
    tags: ["Chef's signature", "Vegetarian"],
    station: "The Risotto Stove",
    story: "Creamy arborio rice folded with greens, herbs and parmesan for an indulgent green plate.",
    chefLine: "Eighteen minutes of stirring. Not one less.",
  },
  {
    id: "carrot-veloute",
    name: "Roasted Carrot & Ginger Velouté",
    price: 340,
    image: `${IMG}/5b7c1b03aabcd2e87461df84162bb836a1616e36454d9dcc47c427780b7fd43e.jpeg`,
    category: "Signature",
    blurb: "Slow-roasted carrots, fresh ginger and toasted seeds.",
    tags: ["Dairy-free", "Warming"],
    station: "By the Soup Pot",
    story: "Slow-roasted carrots, fresh ginger, toasted seeds and a silky, warming finish.",
    chefLine: "Roasted till sweet, blitzed till silky. Pure comfort.",
  },
  {
    id: "coconut-cooler",
    name: "Coconut Espresso Cooler",
    price: 280,
    image: `${IMG}/e24e1a933209ab73e61bb13ac430a040f0205a24d3b5596970170f9de3eab4b0.jpeg`,
    category: "Signature",
    blurb: "Chilled espresso over coconut cream — bright and smooth.",
    tags: ["Chilled", "Coffee"],
    station: "The Coffee Counter",
    story: "A chilled espresso pour with coconut cream — bright, smooth and made for warm afternoons.",
    chefLine: "Give it a swirl before the first sip. Trust me.",
  },
  {
    id: "pistachio-affogato",
    name: "Pistachio Affogato",
    price: 320,
    image: `${IMG}/09160fe2049971f3b470d518aa97d43ad7c35200fe0b6c5d77a6849e196c82b8.jpeg`,
    category: "Signature",
    blurb: "Pistachio gelato, a hot espresso pour and a little crunch.",
    tags: ["Dessert", "Must try"],
    station: "The Sweet Finish",
    story: "Pistachio gelato, a hot espresso pour and just enough crunch to keep you coming back.",
    chefLine: "Hot meets cold. Pour it right down the middle!",
  },
  {
    id: "masala-chai",
    name: "Kulhad Masala Chai",
    price: 120,
    image: `${IMG}/dcaea8bda0ad197e2d3de95e0bbbf49081ee80b1d68eccb4a5ddef9fd3a2d0fd.jpeg`,
    category: "Sides & Sips",
    blurb: "Cardamom, cinnamon and ginger, brewed strong in a clay cup.",
    tags: ["Hot", "Classic"],
  },
  {
    id: "truffle-fries",
    name: "Rosemary Truffle Fries",
    price: 190,
    image: `${IMG}/f6d6e75fe7cb630041141977a9b42f3966d7428e26a3f24b31b80b10958ee125.jpeg`,
    category: "Sides & Sips",
    blurb: "Hand-cut, double-fried, with parmesan and garlic aioli.",
    tags: ["Side", "Shareable"],
  },
  {
    id: "berry-parfait",
    name: "Berry Granola Parfait",
    price: 240,
    image: `${IMG}/10c708cac76bcf5dc32d54bcf9d4e2be94284dcfde25ff8b7f48473f74f7f0b0.jpeg`,
    category: "Sides & Sips",
    blurb: "Hung curd, house granola, fresh berries and wild honey.",
    tags: ["Breakfast", "Light"],
  },
];

export const SIGNATURE = DISHES.filter((d) => d.category === "Signature");
export const DISH_BY_ID: Record<string, Dish> = Object.fromEntries(DISHES.map((d) => [d.id, d]));
