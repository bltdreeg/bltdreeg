# Business overview

Source: `bltdreeg-plan/docs/00-overview.md` and features 07, 08, 10 (local only). This doc replaces the old `BUSINESS.md`.

## The product

A **live queue for barbershops in Egypt**. A customer joins a barber's queue from the app and
sees their position, how many people are ahead, and the expected wait. They can also **book a
future slot** on a barber's chair. Both options exist side by side.

**Core property: the queue must always stay complete and correct.**

## Who is involved

| Actor | What they do | Uses this web app? |
|---|---|---|
| **Customer** | Finds salons, joins a queue or books a slot, checks in by QR, pays cash, rates | **Yes**, the only user of this app |
| **Salon** (tenant) | The business the platform has a contract with. Owns branches, barbers and catalogs. Pays a monthly invoice | No (`tenant-app`) |
| **Branch** | One physical location: chairs, barbers, the rotating QR, one queue per chair | Shown as "the salon" to customers |
| **Salon admin** | Sets the daily roster, opens/closes the branch, manages catalogs, employees and invoices | No |
| **Cashier** | Checks barbers in/out, turns chairs off/on, handles emergencies, applies the discount at payment | No |
| **Reception** | Registers walk-ins and marks visits finished | No |
| **Barber** | Serves customers at a chair. **Has no login.** The profile and rating are owned by the salon | Shown as a choice when booking |
| **Platform admin** | Manages tenants, contract terms, the catalog and settings | No (`central-app`) |

## How money works

- The customer **always pays cash at the salon**. The app never takes a payment from the customer.
- Each salon agrees by contract to a **discount rate for app-sourced visits** (for example 20%).
- **App-sourced visit** = booked in the app **before service starts** **and** proven by the customer
  scanning the branch's rotating QR code **on their own phone**.
- Worked example: in-shop price **250**, contract 20% → gap 50, split by the platform (for example half and half):
  - Walk-in pays **250**, and the platform gets **0**.
  - App-sourced customer pays **225** in cash. The salon owes the platform **25**, which goes on a monthly invoice.
  - The salon nets 200 either way (= 250 − 20%).
- The discount covers the whole bill. Prices are locked at booking, and the contract terms are snapshotted at booking.
- The salon pays the platform monthly through a payment gateway (Fawry / InstaPay / wallet). An unpaid invoice
  leads to **suspension on day 8**: the branch disappears from discovery. Customers already in the shop are still served.
  None of this billing is shown in the web app. It only explains why a branch can vanish from search.

## Why the QR matters

It is the independent proof that the app brought the customer. It unlocks the discount (for the customer)
and the commission (for the platform), and it counts toward the salon's **ranking**
(ties are broken by the number of QR-verified visits). The salon benefits from pushing the app.

## Market

- Egypt. Currency EGP (ج.م). Starts in Cairo/Giza (the mobile demo is seeded for Maadi).
- **Arabic is the default and RTL.** English is optional. Digits are always Western (`0–9`), in both languages.

## Web app scope

In: discovery (home, search and filters, salon page), favorites, the join/booking flow, my bookings,
live tracking, rating, account, auth, marketing pages (download the app, partner with us,
legal pages).

Out: any salon, cashier or admin screen · customer payment · maps / map search · WhatsApp/SMS.

Nice-to-haves from the plan (not committed): favorites (**already built on the web**), salon subscription plans,
barber-facing profile, analytics, category ratings, learning real wait times.
