# Admin Side Firebase Prerequisites

Use these prerequisites before running the Admin web/desktop side.

## 1) Firebase Authentication

Enable the `Email/Password` provider in Firebase Authentication.

Admin login in this project uses:

- Username: `admin` (mapped to email in Firestore)
- Email: `aaronmarkvaliente@gmail.com`
- Password: `admin123`

## 2) Firestore Database

Create Firestore in Native mode.

Deploy rules from `firestore.rules`:

```powershell
npm run deploy:rules
```

## 3) Required Collections

### `incidents`

Used by both user and admin apps.

Expected fields (existing + admin additions):

- `userId` (string)
- `type` (string)
- `status` (string: `active`, `dispatched`, `resolved`, ...)
- `description` (string)
- `location` (map):
- `lat` (number|null)
- `lng` (number|null)
- `accuracy` (number|null)
- `label` (string, optional)
- `timestamp` (timestamp/string)
- `callerName` (string, optional)
- `contact` (string, optional)
- `source` (string, optional: `admin`)
- `metadata` (map, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `emergency_hotlines`

Used by user and admin responders page.

Expected fields:

- `name` (string)
- `phoneNumber` (string)
- `service` (string)
- `head` (string, optional)
- `isActive` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `admin_users`

Admin role/profile document keyed by auth UID.

Document ID: `<auth_uid>`

Fields:

- `uid` (string)
- `username` (string)
- `usernameLower` (string)
- `displayName` (string)
- `email` (string)
- `role` (string: `admin` or `superadmin`)
- `isActive` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `admin_usernames`

Username-to-email login mapping.

Document ID: `<usernameLower>` (example: `admin`)

Fields:

- `uid` (string)
- `email` (string)
- `role` (string)
- `isActive` (boolean)
- `updatedAt` (timestamp)

### `communication_logs`

Admin dispatch/message logs.

Fields:

- `incidentId` (string|null)
- `receiver` (string)
- `status` (string)
- `message` (string)
- `createdAt` (timestamp)

### `admin_settings`

System settings docs.

Document ID used by app: `system_status`

Fields:

- `database` (string: `online`/`offline`)
- `mapService` (string: `online`/`offline`)
- `emergencyApi` (string: `online`/`offline`)
- `updatedAt` (timestamp)

## 4) Environment Variables

Ensure `.env` has:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional for analytics)

## 5) Seed Admin Account

Run:

```powershell
npm run seed:admin
```

This creates/signs in the admin auth user and writes:

- `admin_users/<uid>`
- `admin_usernames/admin`
- `admin_settings/system_status`
- `emergency_hotlines/rescue_team_primary`

## 6) Admin URLs (Vite Dev Server)

After `npm run dev`, open:

- `http://localhost:5173/ADMIN%20SIDE/html/login.html`
- then login with username/email + password.
