# Barber identity

## Who owns the profile

The **salon owner** creates and manages the barber profile. The profile is assigned to a **chair**. Customers rate that profile independently, like an Uber driver rating.

## Why it is not portable

The platform contracts with the **salon**, the stable entity. Barbers move salon to salon. Therefore:

- Profile, reviews, and rating are scoped to `tenant_id`.
- Moving to another salon creates a **new** profile.
- The new rating starts at **zero**.

Do not migrate stars, review counts, or ranking contribution across tenants.

## Login vs floor profile

HR **Employee** / `User` is a tenant-app login (owner, cashier, staff). That user record is not a marketplace barber identity.

If the same person works at two salons, that is two barber profiles (and two ratings), even if they share a login later. Default: new salon ⇒ new profile.
