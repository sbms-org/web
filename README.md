# ServiceBook Web

The ServiceBook web client connects clients with nearby service providers. It includes local provider discovery, a consent-aware work feed, OTP sign-in, and booking requests with one selected meeting mode.

## Run locally

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the SBMS API URL.
2. Install dependencies with `npm install`.
3. Start the Vite development server with `npm run dev`.

The default local API URL is `http://localhost:4242/api/v1`. The web client uses these API routes:

- `POST /auth/send-otp`, `POST /auth/verify-otp`
- `GET /providers/nearby`
- `GET /work-posts/feed`
- `GET /bookings`, `POST /bookings`
- `PATCH /bookings/:id/status`

Location access is requested only after the user chooses the location action. Exact meeting locations are described as private until booking confirmation; the API must enforce this access rule.
