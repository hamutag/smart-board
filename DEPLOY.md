# פריסה לענן (Deploy)

הפרויקט הוא **Vite + React** (SPA) עם React Router.

הקבצים שכבר נמצאים בפרויקט לטובת פריסה:
- `public/_redirects` (Netlify)
- `vercel.json` (Vercel)
- `Dockerfile` + `nginx.conf` (Docker / כל ספק ענן)
- `public/sw.js` (Service Worker לקאש)

---

## אפשרות 1: Vercel (הכי פשוט)
1. מעלים את הקוד ל‑GitHub.
2. ב‑Vercel: **Import Project**
3. Build Command: `npm run build`
4. Output Directory: `dist`

> שימו לב: כבר הוספתי `vercel.json` כדי שכל הראוטים יפלו ל‑`index.html`.

---

## אפשרות 2: Netlify
1. מעלים ל‑GitHub.
2. ב‑Netlify: **Add new site → Import an existing project**
3. Build Command: `npm run build`
4. Publish directory: `dist`

> כבר הוספתי `public/_redirects` כדי ש‑React Router יעבוד.

---

## אפשרות 3: Cloudflare Pages
1. מחברים ריפו Git.
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. SPA fallback: ב‑Cloudflare Pages לרוב עובד אוטומטית, ואם צריך מוסיפים rule ל‑`index.html`.

---

## אפשרות 4: Docker (מומלץ אם רוצים "שרת משלכם")
יש בפרויקט `Dockerfile` שמבצע build ומגיש עם Nginx.

במחשב שלכם (או ב‑CI):
```bash
docker build -t smartboard .
docker run -p 8080:80 smartboard
```
ואז ניגשים:
`http://localhost:8080`

אפשר להעלות את התמונה ל‑Fly.io / Cloud Run / DigitalOcean App Platform / ECS וכו'.

---

## פריסה כאתר סטטי (S3 / Storage)
במחשב שיש בו אינטרנט:
```bash
# אם יש package-lock.json אפשר להשתמש ב־npm ci, אחרת npm install
npm install
npm run build
```
ואז מעלים את התיקייה `dist/` ל‑S3/Storage ומגדירים SPA fallback ל‑`index.html`.

---

## קאש ו"רענון כל שעתיים"
- קאש סטטי + תמונות מנוהל ב‑Service Worker: `public/sw.js`
- רענון נתונים (API) כל ~שעתיים מנוהל ב‑`src/utils/dataCache.js` (TTL של 2 שעות)

אם תרצה לשנות את הזמן:
- ב‑`src/utils/dataCache.js` → `DEFAULT_TTL_MS`
- ב‑`public/sw.js` → `API_MAX_AGE_MS`
