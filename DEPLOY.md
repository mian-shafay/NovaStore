# Deploying NovaStore (free) on your own domain

Free stack: **MongoDB Atlas (M0)** + **Render** (backend API) + **Netlify** (frontend).
Layout used below (replace `yourdomain.com` with your actual domain):

| Layer       | Service                 | URL                                  |
| ----------- | ------------------------ | ------------------------------------ |
| Database    | MongoDB Atlas M0         | —                                     |
| Backend API | Render free web service  | `https://api.yourdomain.com`         |
| Frontend    | Netlify (or Vercel)      | `https://yourdomain.com` (+ `www`)   |

The code changes for deployment are already applied in this project:

- `client/src/utils/api.js` → API base URL reads `VITE_API_URL`.
- `server/server.js` → CORS reads `CLIENT_URL` (+ optional `ALLOWED_ORIGINS`).
- `server/utils/sendEmail.js` → correct `secure` flag for SMTP port 465.
- `client/public/_redirects` and `client/vercel.json` → SPA deep-link fallback.
- `.env.example` files document every variable.

---

## Phase 0 — Push to GitHub

1. (Recommended) Rename the project folder `Ecommerce website` → `ecommerce` (the space causes friction in build configs). Paths below assume `ecommerce/`.
2. Confirm `.env` and `node_modules/` are gitignored (they are). **Never commit `.env`.**
3. Create a GitHub repo and push.

## Phase 1 — MongoDB Atlas

4. **Network Access** → Add IP → `0.0.0.0/0` (Render's free egress IPs are dynamic, so you can't pin them; the DB password is your protection — make it strong).
5. **Database Access** → ensure a user with a strong password exists.
6. Copy the `mongodb+srv://…` connection string for Phase 2.

## Phase 2 — Backend on Render → `api.yourdomain.com`

7. render.com → **New → Web Service** → connect your repo.

8. Settings:

   - **Root Directory:** `ecommerce/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

9. **Environment** → add:

   | Key                  | Value                            |
   | -------------------- | --------------------------------- |
   | `MONGO_URI`          | your Atlas string                 |
   | `JWT_SECRET`         | a long random string              |
   | `ADMIN_SECRET_CODE`  | your admin signup code            |
   | `CLIENT_URL`         | `https://yourdomain.com`          |
   | `ALLOWED_ORIGINS`    | `https://www.yourdomain.com`      |
   | *(SMTP keys)*        | optional, see Phase 5             |

   Do **not** set `PORT` — Render injects it.

10. Deploy. Verify the temporary URL: `https://<app>.onrender.com/api/products` should return JSON.

11. **Settings → Custom Domains** → add `api.yourdomain.com`. Render shows a CNAME target — note it for Phase 4.

## Phase 3 — Frontend on Netlify → `yourdomain.com`

12. netlify.com → **Add new site → Import from Git** → pick the repo.
13. Build settings:
    - **Base directory:** `ecommerce/client`
    - **Build command:** `npm run build`
    - **Publish directory:** `ecommerce/client/dist`
14. **Environment variables** → `VITE_API_URL = https://api.yourdomain.com/api` (Vite bakes env vars at build time — redeploy after any change.)
15. Deploy. Test the temporary `*.netlify.app` URL.
16. **Domain settings** → add custom domain `yourdomain.com` (and `www.yourdomain.com`). Netlify shows the DNS targets — note them for Phase 4.

> Using Vercel instead? Import the repo, set **Root Directory** = `ecommerce/client`,
> add the same `VITE_API_URL`. `vercel.json` already handles SPA routing.

## Phase 4 — DNS at your registrar

17. Add records (use the exact targets Render/Netlify gave you):

    | Type                          | Host       | Value                            |
    | ------------------------------ | ---------- | --------------------------------- |
    | CNAME                          | `api`      | `<app>.onrender.com`              |
    | CNAME                          | `www`      | `<site>.netlify.app`              |
    | A / ALIAS / CNAME-flattening   | `@` (apex) | per Netlify's apex instructions   |

    Netlify gives apex-specific guidance (often an `A` record to their load balancer, or use Netlify DNS). Follow what its dashboard shows for your domain.

18. Wait for propagation (minutes → ~1 hr). Render and Netlify then auto-issue Let's Encrypt TLS. Visit `https://yourdomain.com`.

## Phase 5 — Email for live testing

- **Solo testing:** leave SMTP unset. Ethereal logs a preview URL in Render's logs — open it to see the verification/reset email.
- **Real delivery:** set SMTP env vars on Render. With your domain mailbox:

  ```
  SMTP_HOST=mail.yourprovider.com
  SMTP_PORT=465
  SMTP_USER=contact@yourdomain.com
  SMTP_PASS=<mailbox password>
  FROM_EMAIL=contact@yourdomain.com
  ```

  (`sendEmail.js` sets `secure:true` automatically for port 465.) Brevo's free 300/day SMTP is an alternative if you don't have a domain mailbox.

---

## Things to expect

- **Cold starts:** Render free services sleep after ~15 min idle; the first request then takes 30–50s. Fine for testing. To keep it warm, ping `/api/products` every ~14 min with a free scheduler (e.g. cron-job.org) — this uses most of the 750 free hours/month, which is okay for a single service.
- **Atlas `0.0.0.0/0`** is open to the internet; safe only because access still needs the DB password. Keep it strong.
- **First deploy of frontend** must happen *after* `VITE_API_URL` is set, since Vite inlines it at build time.
