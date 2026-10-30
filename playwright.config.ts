import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    { command: "../chorus/.venv/bin/python -m uvicorn chorus.api:app --app-dir ../chorus --host 127.0.0.1 --port 43190", url: "http://127.0.0.1:43190/health", reuseExistingServer: false, env: { CHORUS_API_KEY: "", CHORUS_DB: join(tmpdir(), `chorus-nanoville-e2e-${process.pid}.sqlite3`), OLLAMA_HOST: "http://127.0.0.1:11435", CHORUS_PACING: "0.6" } },
    { command: "node tests/fixtures/ollama-server.mjs", url: "http://127.0.0.1:11435/health", reuseExistingServer: false },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100", reuseExistingServer: false,
      env: { CHORUS_API_URL: "http://127.0.0.1:43190" },
    },
  ],
});
