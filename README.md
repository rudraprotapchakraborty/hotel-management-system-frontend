# Hotel Management System · Web app

A hotel dining and membership system. Browse the hotel menu, preview dishes before they launch, order in a few taps, review what you ate and join a plan for members-only perks. The app is branded **Hotel Dine**.

Backend repository: [hotel-management-system-backend](https://github.com/rudraprotapchakraborty/hotel-management-system-backend)

## Features

- Menu with search, type and meal-time filters, price range and sorting. The state lives in the address bar, so every view can be linked or reloaded
- Upcoming dishes: members on a paid plan can like them to help decide what launches next
- Dish pages with ingredients, chef, a like button, star reviews (one per member, editable) and a "request this meal" button
- Cart and checkout: dishes and one membership plan per order. Prices are checked on the server. Pay by card with Stripe (test mode) or with SSLCommerz (sandbox, charged in BDT)
- Memberships: Bronze is free, Silver, Gold and Platinum are one-time purchases that raise your tier
- Dashboard for members: overview, cart, orders, reviews and meal requests
- Admin area: manage the menu (add, edit, publish upcoming dishes, remove), serve meal requests, manage members (tier, role, block, delete) and see every payment
- Email and password sign-in with a six digit email code, Google sign-in, forgot-password reset
- Account settings: name, photo, email (confirmed by code), password, sign-in methods, delete account
- Light and dark mode, responsive down to phones
- Shared test accounts (Admin and User) on the sign-in page, locked so settings and the sample menu cannot be changed
- Links from the first version of the site (`/mealDetails/:id`, `/upcomingMeals`, `/dashboard/manageItems` and others) still work

## Stack

React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Stripe Elements, lucide-react.

## Run it locally

You need the [backend](https://github.com/rudraprotapchakraborty/hotel-management-system-backend) running on port 5000.

```bash
npm install
cp .env.example .env.local   # then fill in GOOGLE_CLIENT_ID and STRIPE_PUBLISHABLE_KEY
npm run dev                  # http://localhost:3000
```

In development the dev server proxies `/api` to `http://127.0.0.1:5000`. To try a card payment use Stripe's test card `4242 4242 4242 4242` with any future date and any CVC.

## Environment

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Public Google OAuth client id. The button is hidden when it is empty. |
| `STRIPE_PUBLISHABLE_KEY` | Public Stripe key (`pk_test_...`). Card payments are hidden when it is empty. |
| `VITE_API_URL` | Optional override of the API origin including `/api`. Production defaults to the deployed backend in `src/lib/api.js`. |

## Deploying

The project deploys as a static site (Vercel config included, with a rewrite to `index.html` for client side routing). Set `GOOGLE_CLIENT_ID` and `STRIPE_PUBLISHABLE_KEY` in the host's environment, and add the site's origin to the Google client's authorized JavaScript origins. The backend's `CLIENT_URL` must list this site's origin.

## Credits

Sample dish photos come from Wikipedia and Wikimedia Commons under their free licences.
