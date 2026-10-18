# Beltadreeg — Business Overview

## What it is

Beltadreeg is a marketplace web app for customers in Egypt to discover barber
salons and take a place in a barber's queue — without waiting at the salon.

## Booking model

> Updated 2026-10-18: aligned with the decided spec
> `bltdreeg-plan/docs/features/01-customer-booking-and-live-queue.md` (live queue
> per chair). The earlier "book an appointment and get a predicted queue number"
> model is retired.

Each barber's chair has its own **live queue**, ordered by join time. The
customer picks the services, then a barber, then either:

- **ادخل الطابور دلوقتي (Join now)** — enters that barber's queue immediately
  (only while the salon is open).
- **احجز ميعاد دخول (Reserve a join time)** — a slot is the moment the customer
  *enters* the queue, not a service time: at that time they join behind whoever
  is already queued. Up to two future slots, never two at the same start time.

While in the queue the customer always sees **قدامك كام (people ahead)** and the
**expected wait** (durations of everyone ahead + the barber's remaining time on
the current customer), refreshed live. One live queue at a time; cancelling or
leaving is free until the service starts.

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
5. **مسار الحجز (Booking flow)** — services (on the salon page) → barber (with
   live queue length) → join now / reserve a join time → review,
   with queue preview.
6. **تأكيد الحجز (Booking confirmation)** — lands on the booking details (8).
7. **حجوزاتي (My bookings)** — upcoming / past / empty states.
8. **تفاصيل / متابعة حية (Details / live tracking)** — while queued:
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
| Join time (slot) — not an appointment | ميعاد دخول |
| Join the queue now | ادخل الطابور دلوقتي |
| People ahead | قدامك |
| Queue number | رقمك في الدور |
| Book | احجز |
