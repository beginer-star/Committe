# Vinayaka App — Frontend (React + Vite)

## Setup

```
npm install
cp .env.example .env      # then set VITE_API_URL to your running backend's URL
npm run dev
```

Opens at http://localhost:5173

## Notes

- Every page tries the real API first (`src/api/api.js`) and silently falls back to
  dummy data (`src/api/dummyData.js`) if the backend isn't running yet — so the UI
  is fully clickable even before the .NET API is up.
- Auth token + user info are stored in `localStorage` and attached to every request
  via an axios interceptor.
- `ProtectedRoute` redirects to `/login` if not authenticated, and blocks non-admins
  from `/expenditure`.
- The Pay button calls `GET /members/{id}/upi-link` and redirects to the resulting
  `upi://pay?...` link, which opens whichever UPI app (PhonePe, GPay, Paytm, etc.)
  is installed on the member's phone.
- Login is now username + password only (no team picker) — usernames are globally unique.
- `/register` lets a new committee create its Team + Admin account in one step
  (team name, username, UPI ID, optional UPI ID, mobile number, password).
- On the Team Members page, Admins can click **Import from Excel** to bulk-upload
  members from an `.xlsx` file. A ready-to-fill template is at `public/bulk_import_template.xlsx`
  (downloadable from within the app).
