# NBAI Intranet

Next.js intranet for collecting Digital Workers documentation and uploading files into Google Drive folders.

## What This App Does

- Requires Google login before upload.
- Uploads docs through a Next.js API route, suitable for Vercel.
- Saves files into member folders:
  - Alpha1
  - Alpha8
  - Alpha25
  - Aquaponics
  - Person 5 placeholder
- Creates subfolders automatically:
  - Folder Persona
  - Folder Skills
  - Folder Rules
  - Folder Workflows
- Writes a `.metadata.json` file next to every uploaded doc.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Google Cloud Setup

1. Open <https://console.cloud.google.com/>
2. Create or select a Google Cloud project.
3. Enable `Google Drive API`.
4. Go to `APIs & Services` -> `OAuth consent screen`.
5. Configure app name, support email, and test users if the app is in Testing mode.
6. Go to `APIs & Services` -> `Credentials`.
7. Create `OAuth client ID`.
8. Application type: `Web application`.
9. Add authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback
```

10. Copy `Client ID` and `Client secret`.

## Environment Variables

Local `.env.local` and Vercel project settings need:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_DRIVE_ROOT_URL=https://drive.google.com/drive/folders/...
NEXT_PUBLIC_DRIVE_ROOT_URL=https://drive.google.com/drive/folders/...
GOOGLE_DRIVE_SCOPE=https://www.googleapis.com/auth/drive

DRIVE_FOLDER_ALPHA1=...
DRIVE_FOLDER_ALPHA8=...
DRIVE_FOLDER_ALPHA25=...
DRIVE_FOLDER_AQUAPONICS=...
DRIVE_FOLDER_PERSON5=...
```

For Vercel, change:

```bash
GOOGLE_REDIRECT_URI=https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback
```

## Getting Folder IDs

Open a folder in Google Drive. If the URL is:

```text
https://drive.google.com/drive/folders/1AbCDefGhijkLmNoP
```

The folder ID is:

```text
1AbCDefGhijkLmNoP
```

## GitHub + Vercel Deploy

1. Create a GitHub repo.
2. Push the `NBAI Intranet` app to GitHub.
3. Import the repo in Vercel.
4. Set the environment variables above in Vercel.
5. Deploy.
6. Add the deployed callback URL to Google OAuth credentials.
7. Redeploy after changing env vars.

If this app lives inside a larger repo, set Vercel `Root Directory` to:

```text
NBAI Intranet
```

Basic Git commands from the workspace root:

```bash
git add "NBAI Intranet"
git commit -m "Add NBAI Intranet Next.js app"
git push
```

## Notes

The app requests `https://www.googleapis.com/auth/drive` because it needs to create files inside pre-existing Drive folders. For a stricter production review, this can be reduced later with a Google Picker-based flow, but the current setup is the fastest reliable intranet path.
