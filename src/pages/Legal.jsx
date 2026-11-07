const pages = {
  privacy: {
    title: "Privacy Policy",
    updated: "November 2026",
    sections: [
      ["What we collect", "Your name, email address and, if you add one, a profile photo. If you sign in with Google we receive your name, email and profile picture from Google. We also store your cart, the dishes you like and review, your meal requests, your membership tier and your order records."],
      ["How we use it", "To sign you in, run your cart and orders, grant the membership you buy, send one-time codes to confirm your email and reset your password, email a receipt, and show your name next to the reviews you write. We do not sell your data and we do not show ads."],
      ["What is public", "Browsing the menu needs no account. Reviews show your name, photo and membership tier. Everything else, including your email, cart, requests and orders, is private to you and the hotel's administrators."],
      ["Payments", "Card payments are handled by Stripe and bank or mobile payments by SSLCommerz. We never see or store your card number. We keep the order, its total, the method and a transaction reference. Order records are kept for the hotel's books even if you delete your account."],
      ["Where it is stored", "Account, menu and order data is stored in a MongoDB database. Profile photos are hosted on an image service. Emails are sent through our mail provider."],
      ["Your choices", "You can change your name, photo, email and password in Account settings, and delete your account at any time. Deleting it removes your profile, cart, requests, likes and reviews."],
      ["Cookies and storage", "We keep your sign-in token and your light or dark theme preference in your browser's local storage. There are no tracking or advertising cookies."],
      ["Photos", "Sample dish photos come from Wikipedia and Wikimedia Commons under their free licences."],
      ["Test accounts", "The shared test accounts on the sign-in page are public and pay in sandbox mode. Do not store anything private in them."],
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "November 2026",
    sections: [
      ["Using Hotel Dine", "Hotel Dine is a personal project that demonstrates a hotel dining and membership system. By creating an account or signing in you agree to these terms."],
      ["Your account", "Keep your password safe. You are responsible for activity on your account. Tell us if you think someone else has access to it."],
      ["Orders and payments", "Prices are set by the hotel and checked on the server when you pay. Card and SSLCommerz payments in this project run in test or sandbox mode unless stated otherwise. Do not enter real card details unless the site says payments are live."],
      ["Memberships", "A paid plan raises your membership tier and unlocks features such as liking upcoming dishes. Plans are one-time purchases that cannot be combined, and a plan can only be bought if it is above your current tier."],
      ["Reviews", "Write honest reviews about dishes you have tried. Do not post anything abusive, unlawful or misleading. Administrators may remove reviews that break these terms."],
      ["Acceptable use", "Do not try to break, overload or gain unauthorised access to the service or to other people's data, and do not use automated tools to create accounts, orders or requests in bulk."],
      ["Test accounts", "Shared test accounts are provided for trying the system. They are reset from time to time and some actions, such as changing settings or editing the sample menu, are disabled."],
      ["Availability", "The service is provided as is, with no guarantee that it will always be available or free of errors. Features may change or be removed."],
      ["Ending your account", "You can delete your account at any time in Account settings."],
      ["Changes", "We may update these terms. Continuing to use Hotel Dine after a change means you accept the new version."],
    ],
  },
};

export default function Legal({ page }) {
  const doc = pages[page];
  return (
    <article className="frame max-w-3xl py-14">
      <span className="eyeline">Legal</span>
      <h1 className="display mt-4 text-[clamp(34px,5vw,56px)]">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {doc.updated}</p>
      <div className="mt-10 space-y-8">
        {doc.sections.map(([heading, text]) => (
          <section key={heading}>
            <h2 className="text-lg font-bold tracking-tight">{heading}</h2>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
