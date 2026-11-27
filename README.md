# ServiceBook Web

The ServiceBook web client connects clients with nearby service providers. It includes local provider discovery, a consent-aware work feed, OTP sign-in, and booking requests with one selected meeting mode.

## Run locally

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the SBMS API URL.
2. Install dependencies with `npm install`.
3. Start the Vite development server with `npm run dev`.

The default local API URL is `http://localhost:3000/api/v1`. The web client uses these API routes:

- `POST /auth/send-otp`, `POST /auth/verify-otp`
- `GET /providers/nearby`
- `GET /work-posts/feed`
- `GET /work-posts/consent-requests`, `POST /work-posts/:id/consent`
- `GET /bookings`, `POST /bookings`
- `PATCH /bookings/:id/status`

Location access is requested only after the user chooses the location action. Exact meeting locations are described as private until booking confirmation; the API must enforce this access rule.

## Shared demo data

The API serves the same role-scoped JSON fixture to the web, admin, and mobile
clients when demo mode is active. The sign-in page lists the fixture accounts
for client, provider, broker, support, and admin roles; use OTP `123456`.
Successful reads and writes are shared while the API process runs, but demo
changes are in-memory only and reset on API restart. The client shows a notice
whenever the API returns `X-SBMS-Data-Source: demo`; it does not replace valid
empty results from a populated live database.
