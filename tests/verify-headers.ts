import { spawn } from "child_process";

const PORT = 5002;
const URL = `http://localhost:${PORT}`;

async function verifyHeaders() {
  console.log("Starting server...");
  const server = spawn("pnpm", ["tsx", "server/index.ts"], {
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverStarted = false;
  let serverPid = server.pid;

  const onData = (data: Buffer) => {
    const output = data.toString();
    console.log(`[Server]: ${output.trim()}`);
    if (output.includes(`express server serving on port ${PORT}`)) {
      serverStarted = true;
    }
  };

  server.stdout.on("data", onData);
  server.stderr.on("data", (data) => {
    console.error(`[Server Error]: ${data.toString().trim()}`);
  });

  // Wait for server to start
  const timeout = 30000;
  const start = Date.now();
  while (!serverStarted) {
    if (Date.now() - start > timeout) {
      server.kill();
      throw new Error("Server failed to start within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Server started. Testing headers...");
  try {
    const res = await fetch(URL);
    const headers = res.headers;

    const expectedHeaders = [
      "content-security-policy",
      "x-dns-prefetch-control",
      "strict-transport-security",
      "x-download-options",
      "x-permitted-cross-domain-policies",
      "referrer-policy",
      "x-content-type-options",
      "x-frame-options",
    ];

    let missing = [];
    for (const header of expectedHeaders) {
      if (!headers.get(header)) {
        missing.push(header);
      }
    }

    if (missing.length > 0) {
      console.error("Missing security headers:", missing.join(", "));
      console.log("Current headers:", JSON.stringify(Object.fromEntries(headers.entries()), null, 2));
      process.exit(1);
    } else {
      console.log("All expected security headers present!");
      process.exit(0);
    }

  } catch (error) {
    console.error("Error testing headers:", error);
    process.exit(1);
  } finally {
    console.log("Stopping server...");
    server.kill();
    try { process.kill(serverPid!, 'SIGTERM'); } catch (e) {}
  }
}

verifyHeaders();
