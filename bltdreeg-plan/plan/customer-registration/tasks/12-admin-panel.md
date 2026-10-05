# 12 · Central admin: OTP channels, deliveries, customers

**Depends on:** 04, 10 · **Spec:** §5 (Admin panel)

## Steps
- [ ] Filament page `OtpChannelSettings`: card per channel — enabled toggle, reorderable provider list
      (only keys that support the channel), sort, "send test code" (goes through `OtpDispatcher`, so it
      shows in deliveries). Saving clears the settings cache (model event from task 04).
- [ ] Resource `OtpDeliveries`: read-only, filters by channel, provider, status, date; masked recipient.
- [ ] Resource `Customers`: list, search phone/email, view, disable/enable via `CustomerAccess` (task 10).
- [ ] Shield permissions for super admins, like the existing resources.

## Done when
- [ ] Filament tests (style of `TenantsResourceTest`): settings save + cache clear; deliveries filters;
      disable revokes tokens.
