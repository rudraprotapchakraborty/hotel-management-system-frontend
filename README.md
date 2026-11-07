<div align="center">

# 🍽️ Hotel Management System

**A hotel dining and membership system: browse the menu, order with card or SSLCommerz, review dishes and join a plan.**

[**Live demo**](https://hotel-management-system-frontend-lac.vercel.app/) · [Backend API](https://github.com/rudraprotapchakraborty/hotel-management-system-backend) · [Portfolio](https://rudraprotapchakraborty.com/projects)

![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb) ![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=ffffff) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8) ![Stripe](https://img.shields.io/badge/Stripe-635bff?style=for-the-badge&logo=stripe&logoColor=ffffff) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=ffffff)

<a href="https://hotel-management-system-frontend-lac.vercel.app/"><img src="https://i.ibb.co/gMQ02TjJ/hotel-management-system.webp" alt="Hotel Management System: home page" width="880"></a>

</div>

> The web app of **Hotel Dine**.
>
> - Menu with search and filters, upcoming dishes, reviews and likes
> - Cart and checkout with Stripe cards or the SSLCommerz sandbox, verified on the server
> - Four membership tiers that unlock features
> - Member dashboard and an admin area for the menu, requests, members and payments

A hotel dining system where guests browse the menu with search, type, meal-time and price filters, preview upcoming dishes, read and write star reviews, ask for a meal to be served and order through a cart. Checkout runs on the server: prices always come from the database, and payment is taken with Stripe cards or the SSLCommerz sandbox in BDT, then verified with the gateway before the order is marked paid. Memberships (Bronze, Silver, Gold, Platinum) are one-time purchases that raise a guest's tier and unlock voting on upcoming dishes. Members get a dashboard with their cart, orders, reviews and requests, and admins manage the menu, publish upcoming dishes, serve requests, change member tiers and roles, block members and see every payment. Sign-in works with email and password confirmed by a one-time email code, or with Google, with password reset and an account settings page. Shared test accounts for each role make it easy to try, and the interface supports light and dark themes.

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
| `VITE_API_URL` | Optional override of the API origin including `/api`. Production defaults to `https://hotel-management-system-backend-two.vercel.app/api`. |

## Deploying

The project deploys as a static site (Vercel config included, with a rewrite to `index.html` for client side routing). Set `GOOGLE_CLIENT_ID` and `STRIPE_PUBLISHABLE_KEY` in the host's environment, and add the site's origin to the Google client's authorized JavaScript origins. The backend's `CLIENT_URL` must list this site's origin.

## Credits

Sample dish photos come from Wikipedia and Wikimedia Commons under their free licences.

---

<div align="center">

Made by **[Rudra Protap Chakraborty](https://rudraprotapchakraborty.com)** · [Portfolio](https://rudraprotapchakraborty.com) · [GitHub](https://github.com/rudraprotapchakraborty)

</div>
