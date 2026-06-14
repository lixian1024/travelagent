export type OfflineCardType =
  | "hotel"
  | "dietary"
  | "emergency"
  | "transport"
  | "custom";

export type OfflineCard = {
  id: string;
  type: OfflineCardType;
  title: string;
  primaryText: string;
  secondaryText: string;
  notes: string;
  phone: string;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const DATABASE_NAME = "china-travel-agent";
const DATABASE_VERSION = 1;
const STORE_NAME = "offline-cards";

const defaultCards: OfflineCard[] = [
  {
    id: "default-hotel",
    type: "hotel",
    title: "Hotel address",
    primaryText: "北京璞瑄酒店",
    secondaryText: "北京市东城区王府井大街1号 · The PuXuan Hotel and Spa",
    notes: "Show this card to a driver or station attendant.",
    phone: "",
    pinned: true,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "default-dietary",
    type: "dietary",
    title: "Dietary card",
    primaryText: "我对花生严重过敏，请不要放花生或花生油。微辣。",
    secondaryText: "Severe peanut allergy. No peanuts or peanut oil. Mild spice.",
    notes: "Show this before ordering and ask the server to confirm.",
    phone: "",
    pinned: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "default-emergency",
    type: "emergency",
    title: "Emergency help",
    primaryText: "我需要帮助。请帮我联系警察或急救人员。",
    secondaryText: "I need help. Please contact the police or medical services.",
    notes: "Police 110 · Ambulance 120 · Fire 119",
    phone: "",
    pinned: false,
    sortOrder: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "default-transport",
    type: "transport",
    title: "Train details",
    primaryText: "G5 · 北京南站 → 上海虹桥站",
    secondaryText: "Beijing South → Shanghai Hongqiao",
    notes: "Keep your passport ready for the ticket gate.",
    phone: "",
    pinned: false,
    sortOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("sortOrder", "sortOrder");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function completeTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function sortCards(cards: OfflineCard[]) {
  return cards.sort(
    (left, right) =>
      Number(right.pinned) - Number(left.pinned) ||
      left.sortOrder - right.sortOrder ||
      right.updatedAt.localeCompare(left.updatedAt)
  );
}

export async function getOfflineCards() {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const request = transaction.objectStore(STORE_NAME).getAll();
  const cards = await new Promise<OfflineCard[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as OfflineCard[]);
    request.onerror = () => reject(request.error);
  });
  database.close();

  if (cards.length > 0) return sortCards(cards);

  await Promise.all(defaultCards.map((card) => saveOfflineCard(card)));
  return sortCards([...defaultCards]);
}

export async function saveOfflineCard(card: OfflineCard) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put(card);
  await completeTransaction(transaction);
  database.close();
  return card;
}

export async function deleteOfflineCard(id: string) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(id);
  await completeTransaction(transaction);
  database.close();
}

export function createOfflineCard(sortOrder: number): OfflineCard {
  const timestamp = new Date().toISOString();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `card-${timestamp}`;

  return {
    id,
    type: "custom",
    title: "New offline card",
    primaryText: "",
    secondaryText: "",
    notes: "",
    phone: "",
    pinned: false,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
