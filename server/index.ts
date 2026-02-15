import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { rateLimit } from "./ratelimit";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupSecurityHeaders(app: express.Application) {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");

    // Only allow localhost origins in development to prevent CORS abuse in production
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = isDev && (
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:")
    );

    if (origin && isLocalhost) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  // Determine base URL for dynamic link generation
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = (forwardedProto || req.protocol || "https").replace(/[^a-z]/g, "");
  const forwardedHost = req.header("x-forwarded-host");
  const host = (forwardedHost || req.get("host") || "").split(',')[0].trim();

  // Validate host and protocol to prevent XSS/Host header injection
  if (!/^[a-zA-Z0-9.-]+(:\d+)?$/.test(host) || (protocol !== "http" && protocol !== "https")) {
    return res.status(400).send("Invalid Host or Protocol");
  }

  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  // Simple HTML escape for the placeholders to prevent XSS
  const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m] || m));

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, escapeHtml(baseUrl))
    .replace(/EXPS_URL_PLACEHOLDER/g, escapeHtml(expsUrl))
    .replace(/APP_NAME_PLACEHOLDER/g, escapeHtml(appName));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const distPath = path.resolve(process.cwd(), "dist");
  const hasStaticBuild = fs.existsSync(path.join(distPath, "index.html"));

  if (hasStaticBuild) {
    log("Serving pre-built static web files from dist/");

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.setHeader("Cache-Control", "no-cache");
      next();
    });

    app.use(express.static(distPath));

    app.get("/{*path}", (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const templatePath = path.resolve(
      process.cwd(),
      "server",
      "templates",
      "landing-page.html",
    );
    // Dynamic mode: Proxy to Metro bundler in Dev, or serve static assets in Prod
    const templatePath = path.resolve(process.cwd(), "server", "templates", "landing-page.html");
    const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
    const appName = getAppName();
    const isDev = process.env.NODE_ENV === "development";

    log("No static build found, using dynamic serving");

    if (isDev) {
      const metroProxy = createProxyMiddleware({
        target: "http://localhost:8081",
        changeOrigin: true,
        ws: true,
        logger: undefined,
      });

      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith("/api")) {
          return next();
        }
        return metroProxy(req, res, next);
      });
    } else {
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith("/api")) {
          return next();
        }
        if (req.path !== "/" && req.path !== "/manifest") {
          return next();
        }
        const platform = req.header("expo-platform");
        if (platform && (platform === "ios" || platform === "android")) {
          return serveExpoManifest(platform, res);
        }
        if (req.path === "/") {
          return serveLandingPage({ req, res, landingPageTemplate, appName });
        }
        next();
      });
      app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
      app.use(express.static(path.resolve(process.cwd(), "static-build")));
    }
  }

  log("Expo routing configured");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = process.env.NODE_ENV === "development"
      ? (error.message || "Internal Server Error")
      : "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  app.set("trust proxy", 1);
  setupSecurityHeaders(app);
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  // Apply rate limiting specifically to /api routes
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200, // Increased limit to be more lenient for legitimate users
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    }),
  );

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
