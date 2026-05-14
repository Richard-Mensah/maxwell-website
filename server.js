const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

let PgPool = null;
try {
  ({ Pool: PgPool } = require("pg"));
} catch (error) {
  PgPool = null;
}

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "data", "profile.json");
const CONTACT_FILE = path.join(ROOT, "storage", "contact-submissions.jsonl");
const GALLERY_DIR = path.join(PUBLIC_DIR, "assets", "gallery");

let pool = null;
let schemaReady = false;

const routes = {
  "/": "/index.html",
  "/profile": "/profile.html",
  "/impact": "/impact.html",
  "/agenda": "/agenda.html",
  "/gallery": "/gallery.html",
  "/contact": "/contact.html"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function getPool() {
  if (!process.env.DATABASE_URL || !PgPool) return null;
  if (!pool) {
    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function ensureSchema() {
  const db = getPool();
  if (!db || schemaReady) return Boolean(db);

  await db.query(`
    create table if not exists contact_submissions (
      id bigserial primary key,
      name text not null,
      email text not null,
      organization text,
      interest text,
      message text not null,
      submitted_at timestamptz not null default now()
    );
  `);

  await db.query(`
    create table if not exists site_content (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    );
  `);

  schemaReady = true;
  return true;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function captionFromFilename(filename) {
  const professionalCaptions = [
    "Community leadership and stakeholder engagement",
    "Regional development advocacy in action",
    "Public service engagement with community leaders",
    "Civic leadership and institutional partnership",
    "Youth empowerment and education support",
    "WENDA partnership and development collaboration",
    "School outreach and candidate support",
    "Leadership presence at a formal community event",
    "Engagement with traditional and civic stakeholders",
    "Education access and learning-materials support",
    "Youth mentorship and regional opportunity building",
    "Development advocacy with local institutions"
  ];

  const lower = filename.toLowerCase();
  if (lower.includes("whatsappbusiness") || lower.includes("wenda-new")) {
    return "WENDA communication highlighting development partnership and civic engagement";
  }

  if (lower.includes("img-1010")) {
    return "WENDA and AFRIDELF partnership announcement for development collaboration";
  }

  if (lower.includes("bibiani")) {
    return "WENDA leadership presentation and municipal recognition";
  }

  if (lower.includes("yomi")) {
    return "Formal leadership moment during a public engagement";
  }

  if (lower.includes("20260430")) {
    return "School outreach supporting BECE candidates in the Western North Region";
  }

  const index = Math.abs([...filename].reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return professionalCaptions[index % professionalCaptions.length];
}

function getGalleryImages() {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((filename) => /\.(jpe?g|png|webp|gif)$/i.test(filename))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => ({
      image: `/assets/gallery/${encodeURIComponent(filename)}`,
      caption: captionFromFilename(filename)
    }));
}

async function getProfile() {
  const fallback = readJson(DATA_FILE);
  const db = getPool();
  if (!db) return fallback;

  try {
    await ensureSchema();
    const result = await db.query("select value from site_content where key = $1", ["profile"]);
    return result.rows[0]?.value || fallback;
  } catch (error) {
    return fallback;
  }
}

async function saveContactSubmission(submission) {
  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(
      `
        insert into contact_submissions
          (name, email, organization, interest, message, submitted_at)
        values
          ($1, $2, $3, $4, $5, $6)
      `,
      [
        submission.name,
        submission.email,
        submission.organization,
        submission.interest,
        submission.message,
        submission.submittedAt
      ]
    );
    return "postgres";
  }

  fs.mkdirSync(path.dirname(CONTACT_FILE), { recursive: true });
  fs.appendFileSync(CONTACT_FILE, `${JSON.stringify(submission)}\n`, "utf8");
  return "file";
}

async function handleContact(req, res) {
  try {
    const raw = await collectBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const submission = {
      name: cleanText(payload.name, 120),
      email: cleanText(payload.email, 160),
      organization: cleanText(payload.organization, 160),
      interest: cleanText(payload.interest, 80),
      message: cleanText(payload.message, 1200),
      submittedAt: new Date().toISOString()
    };

    if (!submission.name || !isValidEmail(submission.email) || submission.message.length < 10) {
      sendJson(res, 400, {
        ok: false,
        message: "Please provide your name, a valid email, and a clear message."
      });
      return;
    }

    const storage = await saveContactSubmission(submission);
    sendJson(res, 201, {
      ok: true,
      storage,
      message: "Thank you. Your inquiry has been received."
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: "We could not save the inquiry. Please try again."
    });
  }
}

function serveStatic(req, res, pathname) {
  const routedPath = routes[pathname] || pathname;
  const requestedPath = routedPath === "/" ? "/index.html" : routedPath;
  const decoded = decodeURIComponent(requestedPath);
  const filePath = path.normalize(path.join(PUBLIC_DIR, decoded));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const cacheHeader = ext === ".html" ? "no-store" : "public, max-age=86400";
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": cacheHeader
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/profile") {
    sendJson(res, 200, await getProfile());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/gallery") {
    sendJson(res, 200, getGalleryImages());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "maxwell-profile-site",
      postgresConfigured: Boolean(process.env.DATABASE_URL),
      postgresDriverLoaded: Boolean(PgPool)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    await handleContact(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res, url.pathname);
    return;
  }

  sendJson(res, 405, { ok: false, message: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Maxwell Kwadwo Baidoo website running at http://localhost:${PORT}`);
});
