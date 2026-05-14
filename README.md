# Maxwell Kwadwo Baidoo Website

Professional full-stack profile website for Maxwell Kwadwo Baidoo, built from the supplied profile document and image folder.

## Run Locally

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Pages:

```text
http://localhost:3000/profile
http://localhost:3000/impact
http://localhost:3000/agenda
http://localhost:3000/gallery
http://localhost:3000/contact
```

## What Is Included

- Node.js backend with optional PostgreSQL support through `pg`.
- Separate pages for profile, impact, agenda, gallery and contact.
- `/api/profile` endpoint serving structured site content from `data/profile.json`.
- `/api/gallery` endpoint serving all images from `public/assets/gallery`.
- `/api/contact` endpoint for inquiry submissions.
- Contact submissions are stored in Neon PostgreSQL when `DATABASE_URL` is configured, otherwise locally at `storage/contact-submissions.jsonl`.

## Neon PostgreSQL

Install dependencies once:

```bash
npm install
```

Set your Neon connection string in `.env`:

```text
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Or set it directly in PowerShell:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
npm start
```

The server automatically creates the `contact_submissions` and `site_content` tables. The SQL is also available in:

```text
database/schema.sql
```

To keep site copy in Neon, insert a `site_content` row with `key = 'profile'` and the JSON from `data/profile.json` as `value`. If that row is not present, the app uses `data/profile.json`.

## Edit Content

Update the biography, metrics, focus areas, timeline, impact items and gallery in:

```text
data/profile.json
```

Update layout and visual styling in:

```text
public/styles.css
```
