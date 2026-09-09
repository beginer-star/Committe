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


## Updated login and UPI payment flow

- Team member login now requires selecting a Team first.
- After selecting a Team, the Team member dropdown is populated from the API.
- Selecting a member automatically fills the default password `Member@123`; the password remains editable.
- Member login is validated by both Team ID and Member ID on the backend.
- The Pay button now opens a payment-app chooser instead of immediately marking the payment as successful.
- Google Pay, PhonePe, Paytm, BHIM and a generic UPI option are provided.
- The selected app receives the team's configured UPI ID and the entered amount through a UPI deep link.
- The browser cannot reliably confirm whether an external UPI app completed a payment. Therefore the payment is not marked as paid just because the app was opened.

Run the frontend with:

```text
npm install
npm run dev
```

For production:

```text
npm install
npm run build
```
