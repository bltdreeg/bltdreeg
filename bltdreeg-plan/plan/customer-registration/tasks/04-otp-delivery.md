# 04 · OTP providers, dispatcher, channel settings

**Depends on:** 02, 03 · **Spec:** §5

## Goal
Codes go through a swappable provider per channel, never switch the user's chosen channel, and
every attempt is logged.

## Steps
- [ ] `OtpProvider` contract: `send(OtpMessage): DeliveryResult`, plus the two value objects.
- [ ] `OtpProviderManager` (Laravel `Manager`), drivers `log`, `fake`, `mail`; provider config under
      `customer_auth.otp.providers.*`.
- [ ] `LogOtpProvider`, `FakeOtpProvider` (records sends, can be told to fail), `MailOtpProvider`.
- [ ] Future HTTP vendors must use a short timeout (~5 s). Sending is synchronous (the dispatcher needs
      the result to fall back) and runs inside an Octane worker.
- [ ] Keep manager and dispatcher stateless: no per-request data on singletons (central-app runs Octane).
- [ ] `OtpChannelSetting` reads through cache key `customer_auth.otp_channel_settings`; the model's
      `saved` event clears it.
- [ ] `OtpDispatcher`: channel enabled? else `auth.channel_unavailable` → try providers in order →
      one `otp_deliveries` row per attempt (masked recipient) → first success wins → all failed →
      `auth.delivery_failed` (503). Never switches channel.
- [ ] Default channel when omitted: first enabled phone channel by `sort`. Email purposes always use `email`.

## Done when
- [ ] Pest: disabled channel rejected; default channel; fallback to the 2nd provider; never switches
      channel; deliveries rows written; cache cleared on save.
