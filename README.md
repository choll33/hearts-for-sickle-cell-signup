# Dec 5 Volunteer Sign-Up

A public volunteer sign-up page for the Hearts for Sickle Cell blood drive
(Saturday Dec 5, Calvary Baptist Church, Plainfield NJ). Anyone with the link
can claim an open shift; names are stored in a Google Sheet.

## How it works

- `index.html` is the whole page — static HTML/CSS/JS, hosted for free on
  GitHub Pages.
- `apps-script/Code.gs` is a small backend that runs on Google's servers
  (Google Apps Script), reading and writing a Google Sheet. The page talks
  to it over HTTP.
- There's no database or server to pay for or maintain — just a Google Sheet.

## One-time setup

### 1. Create the Google Sheet + backend

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like "Dec 5 Volunteer Signups".
2. Copy its **Sheet ID** from the browser address bar — it's the long
   string of letters/numbers between `/d/` and `/edit`, e.g. in
   `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOp/edit`
   the ID is `1AbCdEfGhIjKlMnOp`.
3. Open your Apps Script project (script.google.com), delete any starter
   code in the editor, then paste in the full contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. Near the top of the pasted code, replace
   `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the Sheet ID you copied in
   step 2.
5. Click **Save** (the disk icon).
6. Click the blue **Deploy** button (top right) → **New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything, e.g. "Dec 5 signup backend".
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy**.
7. The first time, Google will ask you to authorize the script — click
   through the consent screens (it may warn "Google hasn't verified this
   app"; click **Advanced → Go to (your project name)** since you wrote
   the script yourself).
8. Copy the **Web app URL** it gives you (ends in `/exec`). You'll need it
   in the next step.

   Note: this "Deploy" is inside Google's Apps Script editor — it's
   unrelated to GitHub's "deploy" (which publishes the web page itself,
   see step 3 below). They're two separate products that happen to share
   the word "deploy".

### 2. Point the page at your backend

1. Open `index.html` in this repo.
2. Find this line near the top of the `<script>` block:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the Web app URL you copied, e.g.:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Save and commit the change.

### 3. Publish on GitHub Pages

1. Push this repo to GitHub (public repo).
2. In the repo on GitHub: **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch",
   branch **main**, folder **/ (root)**. Save.
4. GitHub will give you a URL like
   `https://<your-username>.github.io/<repo-name>/` — that's the link to
   share with volunteers.

### 4. Test it

1. Open the Pages URL, claim a spot with your name.
2. Check the Google Sheet — a new row should appear in the "Slots" tab.
3. Open the page in a different browser (or incognito) and confirm the
   spot now shows as taken, and that you can't remove someone else's name
   from a different browser.

## Notes & limitations

- **Removing a sign-up**: only works from the same browser that created
  it (it checks a private token saved in that browser's local storage).
  If someone needs to cancel from a different device, edit the Google
  Sheet directly — clear that row's Name/Group/Token cells.
- **Updates aren't instant**: the page polls for new sign-ups every 10
  seconds (see `REFRESH_MS` in `index.html`), so two people signing up for
  the same spot within that window are still protected against double-
  booking server-side (the backend locks and checks before saving) — it's
  just the *display* that may lag a few seconds.
- **Capacity**: Google Apps Script web apps are free but have usage quotas
  (roughly 20,000 requests/day on a personal account) — far more than a
  single sign-up sheet like this will ever need.
