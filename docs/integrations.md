# Xvond Store integrations

## Customer authentication

Xvond Store supports four customer sign-in paths at the application layer:

- Email and password: built in and stored by Xvond Store.
- Google: OAuth/OpenID Connect using Google Identity credentials.
- Apple: Sign in with Apple using Apple Developer credentials.
- Oman phone number: OTP through Twilio Verify for the initial implementation. Ooredoo Oman CAMARA OTP can be added behind the same phone-auth interface later without changing customer accounts.

External sign-in buttons are exposed only when the required provider credentials are configured. External identities are linked to the local Xvond customer record so orders, wishlist and addresses remain attached to one account.

Required environment values are represented by the corresponding Settings fields:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_REDIRECT_URI`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`

Do not commit real provider secrets.

## Courier tracking

Orders can have one shipment record containing the courier provider, external shipment ID, tracking number, tracking URL, current shipment status and COD status. Shipment events form the customer-visible tracking timeline.

Admin can attach or update a shipment with:

`PUT /api/v1/admin/orders/{order_id}/shipment`

Admin can append a tracking event with:

`POST /api/v1/admin/shipments/{shipment_id}/events`

A normalized secured webhook is available at:

`POST /api/v1/courier/webhook`

It requires `X-Xvond-Courier-Secret` matching `COURIER_WEBHOOK_SECRET`.

For a courier with a native API such as Zaajil, implement a provider adapter that maps the courier's signed webhook/status payload into this normalized shipment event format. Do not guess provider URLs, credentials or signature formats; use the courier's issued integration documentation.

When a shipment event indicates `delivered`, the Xvond order becomes delivered. For cash-on-delivery orders, a `cod_status` of `collected` or `settled` marks the order payment as paid.
