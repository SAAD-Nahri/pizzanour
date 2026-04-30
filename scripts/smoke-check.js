const fs = require("fs/promises");
const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const websitePort = 3302;
const adminPort = 3303;
const startupTimeoutMs = 15000;
const smokeRuntimeDir = path.join(projectRoot, "output", "smoke-runtime");
const bundledDataFile = path.join(projectRoot, "data.json");
const uploadsDir = path.join(projectRoot, "uploads");
const adminCredentials = {
  user: "admin",
  pass: "foody2026"
};

async function main() {
  const runtime = await prepareSmokeRuntime();
  const websiteServer = startServer("website-server.js", websitePort, runtime);
  const adminServer = startServer("admin-server.js", adminPort, runtime);

  try {
    await Promise.all([
      waitForHealth(`http://127.0.0.1:${websitePort}/health`, "website"),
      waitForHealth(`http://127.0.0.1:${adminPort}/health`, "admin")
    ]);

    await runChecks(websitePort, adminPort);
    await runAuthenticatedAdminRoundTrip(websitePort, adminPort, runtime);
    await runUploadValidationChecks(adminPort);
    console.log("Smoke checks passed.");
  } finally {
    await Promise.allSettled([stopServer(websiteServer), stopServer(adminServer)]);
    await fs.rm(smokeRuntimeDir, { recursive: true, force: true });
  }
}

async function prepareSmokeRuntime() {
  await fs.rm(smokeRuntimeDir, { recursive: true, force: true });
  await fs.mkdir(smokeRuntimeDir, { recursive: true });
  await fs.copyFile(bundledDataFile, path.join(smokeRuntimeDir, "data.json"));
  return {
    dataFile: path.join(smokeRuntimeDir, "data.json"),
    authFile: path.join(smokeRuntimeDir, "auth.json"),
    backupDir: path.join(smokeRuntimeDir, "data-backups")
  };
}

function startServer(entryFile, port, runtime) {
  const child = spawn(process.execPath, [entryFile], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      COOKIE_SECURE: "false",
      DATA_FILE: runtime.dataFile,
      AUTH_FILE: runtime.authFile,
      DATA_BACKUP_DIR: runtime.backupDir,
      UPLOADS_DIR: uploadsDir,
      ADMIN_USER: adminCredentials.user,
      ADMIN_PASS: adminCredentials.pass
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${entryFile}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${entryFile}] ${chunk}`);
  });

  return child;
}

async function waitForHealth(url, serviceName) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < startupTimeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const payload = await response.json();
        if (payload.status === "ok") {
          return payload;
        }
      }
    } catch (_error) {
      // Keep polling until timeout.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for ${serviceName} health check at ${url}`);
}

async function runChecks(websitePort, adminPort) {
  await assertJson(`http://127.0.0.1:${websitePort}/health`, 200, (payload) => {
    if (payload.service !== "website") {
      throw new Error("Website health payload did not include the expected service name.");
    }
  });
  await assertSecurityHeaders(`http://127.0.0.1:${websitePort}/health`);

  await assertJson(`http://127.0.0.1:${websitePort}/api/data`, 200, (payload) => {
    if (!payload || !Array.isArray(payload.menu)) {
      throw new Error("Website /api/data did not return a restaurant payload with menu data.");
    }
  });

  await assertStatus(`http://127.0.0.1:${websitePort}/admin.html`, 404);

  await assertJson(`http://127.0.0.1:${adminPort}/health`, 200, (payload) => {
    if (payload.service !== "admin") {
      throw new Error("Admin health payload did not include the expected service name.");
    }
  });
  await assertSecurityHeaders(`http://127.0.0.1:${adminPort}/health`);

  await assertJson(`http://127.0.0.1:${adminPort}/api/admin/session`, 200, (payload) => {
    if (payload.authenticated !== false) {
      throw new Error("Admin session endpoint should report unauthenticated by default.");
    }
  });

  await assertJson(`http://127.0.0.1:${adminPort}/api/data`, 401, (payload) => {
    if (payload.error !== "unauthorized") {
      throw new Error("Admin /api/data should reject unauthenticated requests.");
    }
  });
}

async function runAuthenticatedAdminRoundTrip(websitePort, adminPort, runtime) {
  const adminBaseUrl = `http://127.0.0.1:${adminPort}`;
  const websiteBaseUrl = `http://127.0.0.1:${websitePort}`;
  const cookie = await loginToAdmin(adminBaseUrl);
  const original = await getJsonWithHeaders(`${adminBaseUrl}/api/data`, {
    headers: { Cookie: cookie }
  });
  const originalData = JSON.parse(JSON.stringify(original.payload));
  const originalShortName = String(originalData?.branding?.shortName || "");
  const marker = `Smoke ${Date.now()}`;

  try {
    const nextPayload = JSON.parse(JSON.stringify(originalData));
    nextPayload.branding = {
      ...(nextPayload.branding || {}),
      shortName: marker
    };

    const saveResult = await postJson(`${adminBaseUrl}/api/data`, nextPayload, cookie);
    if (!saveResult.payload?.ok || saveResult.payload?.data?.branding?.shortName !== marker) {
      throw new Error("Admin save round-trip did not return the updated normalized branding short name.");
    }
    if (!saveResult.payload?.meta?.dataVersion) {
      throw new Error("Admin save response did not include dataVersion metadata.");
    }
    const backupFiles = await fs.readdir(runtime.backupDir).catch(() => []);
    if (!backupFiles.some((fileName) => fileName.endsWith(".json"))) {
      throw new Error("Admin save did not create a JSON data backup.");
    }

    const adminReloaded = await getJsonWithHeaders(`${adminBaseUrl}/api/data`, {
      headers: { Cookie: cookie }
    });
    if (adminReloaded.payload?.branding?.shortName !== marker) {
      throw new Error("Admin reload did not return the freshly saved branding short name.");
    }

    const menuPayload = await getJsonWithHeaders(`${websiteBaseUrl}/api/menu-data`);
    const homePayload = await getJsonWithHeaders(`${websiteBaseUrl}/api/home-data`);
    if (menuPayload.payload?.branding?.shortName !== marker) {
      throw new Error("Public menu payload did not reflect the admin save.");
    }
    if (homePayload.payload?.branding?.shortName !== marker) {
      throw new Error("Public home payload did not reflect the admin save.");
    }

    const savedVersion = String(saveResult.payload.meta.dataVersion);
    const adminVersion = String(adminReloaded.headers.get("x-data-version") || "");
    const menuVersion = String(menuPayload.headers.get("x-data-version") || "");
    const homeVersion = String(homePayload.headers.get("x-data-version") || "");
    if (!adminVersion || !menuVersion || !homeVersion) {
      throw new Error("One of the admin/public data endpoints did not expose X-Data-Version.");
    }
    if (adminVersion !== savedVersion || menuVersion !== savedVersion || homeVersion !== savedVersion) {
      throw new Error("Admin/public data versions drifted after the save round-trip.");
    }
  } finally {
    const restorePayload = JSON.parse(JSON.stringify(originalData));
    const restoreResult = await postJson(`${adminBaseUrl}/api/data`, restorePayload, cookie);
    if (!restoreResult.payload?.ok) {
      throw new Error("Smoke restore failed after the admin round-trip.");
    }

    const restoredMenu = await getJsonWithHeaders(`${websiteBaseUrl}/api/menu-data`);
    const restoredHome = await getJsonWithHeaders(`${websiteBaseUrl}/api/home-data`);
    if (String(restoredMenu.payload?.branding?.shortName || "") !== originalShortName) {
      throw new Error("Public menu payload did not restore the original branding short name.");
    }
    if (String(restoredHome.payload?.branding?.shortName || "") !== originalShortName) {
      throw new Error("Public home payload did not restore the original branding short name.");
    }
  }
}

async function loginToAdmin(adminBaseUrl) {
  const response = await fetch(`${adminBaseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: adminCredentials.user,
      password: adminCredentials.pass
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(`Admin login failed during smoke check: ${payload.error || response.status}`);
  }

  const cookie = response.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Admin login succeeded but no session cookie was returned.");
  }
  return cookie.split(";")[0];
}

async function runUploadValidationChecks(adminPort) {
  const adminBaseUrl = `http://127.0.0.1:${adminPort}`;
  const cookie = await loginToAdmin(adminBaseUrl);

  const fakeUpload = await postMultipart(`${adminBaseUrl}/api/upload`, {
    cookie,
    fileName: "fake.jpg",
    type: "image/jpeg",
    bytes: Buffer.from("not a real jpeg")
  });
  if (fakeUpload.status !== 400 || fakeUpload.payload?.error !== "file_signature_mismatch") {
    throw new Error(`Expected fake jpg upload to be rejected, got ${fakeUpload.status}: ${fakeUpload.payload?.error || "unknown"}.`);
  }

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/akq9ZQAAAAASUVORK5CYII=",
    "base64"
  );
  const validUpload = await postMultipart(`${adminBaseUrl}/api/upload`, {
    cookie,
    fileName: "tiny.png",
    type: "image/png",
    bytes: tinyPng
  });
  if (validUpload.status !== 200 || !validUpload.payload?.url || !validUpload.payload.url.endsWith(".webp")) {
    throw new Error(`Expected tiny png upload to succeed, got ${validUpload.status}: ${validUpload.payload?.error || "unknown"}.`);
  }
  if (validUpload.payload.optimized !== true || !Number.isFinite(Number(validUpload.payload.size))) {
    throw new Error("Expected valid image upload to report optimization metadata.");
  }
  const uploadedResponse = await fetch(`${adminBaseUrl}${validUpload.payload.url}`, {
    headers: { Cookie: cookie }
  });
  if (!uploadedResponse.ok || !String(uploadedResponse.headers.get("content-type") || "").includes("image/webp")) {
    throw new Error("Optimized image upload was not served back as WebP.");
  }
}

async function getJsonWithHeaders(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Expected success from ${url}, got ${response.status}.`);
  }
  const payload = await response.json();
  return { payload, headers: response.headers };
}

async function postJson(url, payload, cookie = "") {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Expected success from ${url}, got ${response.status}: ${body.error || response.statusText}`);
  }
  return { payload: body, headers: response.headers };
}

async function postMultipart(url, { cookie, fileName, type, bytes }) {
  const form = new FormData();
  form.append("image", new Blob([bytes], { type }), fileName);
  const response = await fetch(url, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload, headers: response.headers };
}

async function assertStatus(url, expectedStatus) {
  const response = await fetch(url);
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, got ${response.status}.`);
  }
}

async function assertJson(url, expectedStatus, validate) {
  const response = await fetch(url);
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, got ${response.status}.`);
  }

  const payload = await response.json();
  validate(payload);
}

async function assertSecurityHeaders(url) {
  const response = await fetch(url);
  const expectedHeaders = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "referrer-policy": "strict-origin-when-cross-origin"
  };

  for (const [name, expected] of Object.entries(expectedHeaders)) {
    const actual = response.headers.get(name);
    if (actual !== expected) {
      throw new Error(`Expected ${name}: ${expected} from ${url}, got ${actual || "(missing)"}.`);
    }
  }
}

async function stopServer(child) {
  if (!child || child.killed) return;

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }, 3000);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    child.kill("SIGTERM");
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
