export const money = (n) => `$${Number(n).toFixed(2)}`;

export const TYPE_LABELS = {
  breakfast: "Breakfast",
  soup: "Soups",
  salad: "Salads",
  sandwich: "Sandwiches",
  burger: "Burgers",
  pizza: "Pizza",
  pasta: "Pasta",
  main: "Mains",
  dessert: "Desserts",
};

export const TIME_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

export const BADGES = ["bronze", "silver", "gold", "platinum"];
export const BADGE_LABELS = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" };
export const tierOf = (badge) => Math.max(0, BADGES.indexOf(badge ?? "bronze"));

/** "Today, 6:30 PM", "Yesterday" or a short date. */
export function formatDate(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return `Today, ${time}`;
  if (d.toDateString() === new Date(Date.now() - 86_400_000).toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;
}
