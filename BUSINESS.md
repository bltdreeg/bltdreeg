# Beltadreeg — Business Overview

## What it is

Beltadreeg is a marketplace web app for customers in Egypt to discover barber
salons and book appointments — similar in booking model to Fresha.

## Booking model

The customer picks a specific time slot (not a live walk-in queue). After
booking, they get two things:

- **الميعاد (Appointment)** — the actual reserved time.
- **رقمك في الدور (Queue number)** — their position in line on appointment day.

The queue number is a core product promise, not a side feature. While
choosing a slot, the customer sees: "لو حجزت 6:30 م هيكون رقمك في الدور 3"
("If you book 6:30 PM, you'll be #3 in line") — this is the product's
differentiating moment.

## Target users

Customers only. No barbers, no salon owners, no admin dashboard in this
product.

## Market

Egypt — pricing in EGP (ج.م), Egyptian names, Cairo and Giza areas.

## Design direction

- **Concept B — "التذكرة" (The Ticket)**: salon cards look like tickets —
  image on top, dotted perforation line in the middle, time as the largest
  element on the card.
- **Colors**: Teal `#0F766E` as primary, paired with a neutral palette.
- **Font**: Cairo — weights 400/600/700/800.
- **Direction**: full RTL — `lang="ar" dir="rtl"`, logical CSS properties
  (`ms-*`, `me-*`, `ps-*`, `pe-*`).

## Pages (10)

1. **الرئيسية (Home)** — hero, recently viewed, recommended, today's
   appointments, new in your area, most booked, app download, customer
   reviews, explore by area.
2. **البحث والفلاتر (Search & filters)** — date strip + chips + grid/list view.
3. **صفحة الصالون (Salon page)** — gallery, tabs: خدمات (services) / حلاقين
   (barbers) / تقييمات (reviews) / معلومات (info).
4. **المفضلة (Favorites)**.
5. **مسار الحجز (Booking flow)** — 3 steps: service → barber → appointment,
   with queue preview.
6. **تأكيد الحجز (Booking confirmation)** — appointment + queue number.
7. **حجوزاتي (My bookings)** — upcoming / past / empty states.
8. **تفاصيل / متابعة حية (Details / live tracking)** — on appointment day:
   your number, how many ahead of you, running late/on time.
9. **حسابي (My account)**.
10. **Auth** — login, sign-up, OTP, forgot password.

## Explicitly out of scope

- No map or map-based search.
- No live queue as a discovery mechanic.
- No barber/owner dashboard.

## Glossary (locked terminology)

| English | Approved Arabic |
|---|---|
| Salon | الصالون |
| Barber | الحلاق |
| Service | الخدمة |
| Appointment | الميعاد |
| Queue number | رقمك في الدور |
| Book | احجز ميعاد |
