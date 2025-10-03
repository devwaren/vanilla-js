const JSFilebasedRouter = () => {
  return {
    name: "js-filebased-router",
    async buildStart() {
      if (typeof process === "undefined" || !process.versions?.node) return;

      const fs = await import("fs/promises");
      const path = await import("path");
      const chokidar = await import("chokidar");

      const PAGES_DIR = path.resolve("src/pages");
      const GEN_DIR = path.resolve("src/gen");
      const ROUTES_DIR = path.resolve("src/routes");
      const OUTPUT_FILE = path.join(GEN_DIR, "jsrouter.gen.js");
      const ROOT_FILE = path.join(ROUTES_DIR, "__root.js");

      const isDev = process.env.NODE_ENV !== "production";

      async function ensureDir(dir) {
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch { }
      }

      function toRoutePath(filePath, baseDir) {
        let route = "/" + path.relative(baseDir, filePath).replace(/\\/g, "/");
        route = route.replace(/\.js$/, "").replace(/\/index$/, "") || "/";
        return route.replace(/\[(.+?)\]/g, ":$1");
      }

      function toRouteNameFromPath(routePath) {
        return (
          routePath
            .replace(/^\//, "")
            .split("/")
            .map((p) => (p.startsWith(":") ? p.slice(1) : p))
            .filter(Boolean)
            .join("-") || "index"
        );
      }

      function toImportNameFromRoute(filePath, baseDir) {
        const relative = path.relative(baseDir, filePath).replace(/\\/g, "/");
        const parts = relative.split("/").filter(Boolean);
        const fileName = parts[parts.length - 1].replace(".js", "");
        const folderName = parts.length > 1 ? parts[parts.length - 2] : "";

        if (fileName === "index") {
          return folderName
            ? folderName.charAt(0).toUpperCase() + folderName.slice(1)
            : "Index";
        }

        if (fileName.startsWith("[") && fileName.endsWith("]")) {
          const paramName = fileName.slice(1, -1);
          return (
            folderName.charAt(0).toUpperCase() +
            paramName.charAt(0).toUpperCase() +
            paramName.slice(1)
          );
        }

        return fileName.charAt(0).toUpperCase() + fileName.slice(1);
      }

      async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        let routes = [];

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            routes = routes.concat(await walk(fullPath));
          } else if (entry.isFile() && entry.name.endsWith(".js")) {
            const route = toRoutePath(fullPath, PAGES_DIR);
            const routeName = toRouteNameFromPath(route);
            const importName = toImportNameFromRoute(fullPath, PAGES_DIR);
            routes.push({ file: fullPath, route, routeName, importName });
          }
        }
        return routes;
      }

      function createEntryClientTemplate() {
        return `import { useInitialDOM } from "@devwareng/vanilla-js";
import App from "./App";

useInitialDOM("app", App)`;
      }

      function createEntryServerTemplate() {
        return `import App from './App'

export function render(_url) {
  const html = App()
  return { html }
}`;
      }

      function createAppTemplate() {
        return `import { html, useJSComponent, useJSElements, useJSNoReload, useJSSSRHydration } from '@devwareng/vanilla-js'
import { Router } from './routes/__root';
import "tailwindcss/index.css"

export default function App(DOM) {
  const { isDOM } = useJSSSRHydration(DOM)
  if (!isDOM) return

  const ui = useJSElements(
    isDOM,
    html\`
      <div class="min-h-screen text-white bg-black">
        <div id="routes"></div>
      </div>
    \`
  )

  useJSNoReload(isDOM)
  useJSComponent("routes", isDOM, Router)

  return ui
}`;
      }

      function createPageTemplate(componentName, routePath) {
        const hasParams = routePath.includes(":");
        const paramName = hasParams
          ? routePath.match(/:([^/]+)/)?.[1]
          : null;

        return `import { html, useJSElements, useJSMetaData${hasParams ? ", useJSExtractParams" : ""
          } } from '@devwareng/vanilla-js';

export default function ${componentName}(DOM) {
   ''
  useJSMetaData({ 
      name: '${componentName.toLowerCase()}', 
      description: '', 
      author: '' 
  });

  ${hasParams
            ? `const params = useJSExtractParams("${routePath}");\n  if (!params.${paramName}) return;`
            : ""
          }
  const ui = useJSElements(
    DOM,
    html\`
      <div class="p-4 animate__animated animate__fadeIn duration-300">
        <h1>${componentName}</h1>
        ${hasParams ? `<pre>\${JSON.stringify(params, null, 2)}</pre>` : ""}
      </div>
    \`
  );

  return ui
}`;
      }

      function createRootTemplate() {
        return `import { createRouter } from "@/gen/jsrouter.gen";
import { useJSParams } from "@devwareng/vanilla-js";

// This file is auto-generated

export const Router = (DOM) => {
  useJSParams.getState();
  const router = createRouter(DOM);
  router.navigate(window.location.pathname);

  window.addEventListener("popstate", () => {
    router.navigate(window.location.pathname);
  });
};`;
      }

      async function generate() {
        const routes = await walk(PAGES_DIR);
        const notFoundRoute = routes.find((r) => r.route === "/notfound");
        const normalRoutes = routes.filter((r) => r.route !== "/notfound");

        for (const r of routes) {
          const content = (await fs.readFile(r.file, "utf-8")).trim();
          if (!content) {
            await fs.writeFile(
              r.file,
              createPageTemplate(r.importName, r.route),
              "utf-8"
            );
          }
        }

        const imports = routes
          .map((r) => {
            const importPath =
              "../pages/" +
              path
                .relative(PAGES_DIR, r.file)
                .replace(/\\/g, "/")
                .replace(/\.js$/, "");
            return `import ${r.importName} from "${importPath}";`;
          })
          .join("\n");

        const routeObjects = normalRoutes
          .map(
            (r) =>
              `{ path: "${r.route}", name: "${r.routeName}", component: (DOM) => ${r.importName}(DOM) }`
          )
          .join(",\n  ");

        const notFoundExport = notFoundRoute
          ? `export const NotFound = ${notFoundRoute.importName}`
          : `export function NotFound(DOM) {
  return useJSElements(DOM, html\`<div class="animate__animated animate__fadeIn duration-300 p-4"><h1>404 - Page Not Found</h1></div>\`)
}`;

        const content = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
import { html, useJSElements } from "@devwareng/vanilla-js"

${imports}

${notFoundExport}

export function RootDocument(DOM) {
  return useJSElements(DOM, html\`<div><h1>Root</h1></div>\`)
}

export const routeTree = [
  ${routeObjects}
]

export function createRouter(DOM) {
  function matchRoute(path) {
    for (const route of routeTree) {
      const keys = []
      const regex = new RegExp("^" + route.path.replace(/:([^/]+)/g, (_, key) => {
        keys.push(key)
        return "([^/]+)"
      }) + "$")
      const pathname = path.split("?")[0]
      const match = pathname?.match(regex)
      if (match) {
        const params = {}
        keys.forEach((key, i) => (params[key] = match[i + 1] || ""))
        return { ...route, params }
      }
    }
    return null
  }

  function navigate(path) {
    const match = matchRoute(path)
    if (match) { match.component(DOM); history.pushState({}, "", path) }
    else { NotFound(DOM) }
  }

  window.addEventListener("popstate", () => {
    const path = window.location.pathname + window.location.search
    const match = matchRoute(path)
    if (match) { match.component(DOM) }
    else { NotFound(DOM) }
  })

  navigate(window.location.pathname + window.location.search)
  return { navigate, routes: routeTree }
}
`;

        await ensureDir(GEN_DIR);
        await fs.writeFile(OUTPUT_FILE, content, "utf-8");
        await fs.writeFile(ROOT_FILE, createRootTemplate(), "utf-8");
      }

      await ensureDir(GEN_DIR);
      await ensureDir(ROUTES_DIR);
      await ensureDir(PAGES_DIR);

      await generate();

      if (isDev) {
        const watcher = chokidar.watch(PAGES_DIR);

        watcher.on("all", async (event, filePath) => {
          if (!filePath.endsWith(".js")) return;

          if (event === "add") {
            const baseName = path.basename(filePath, ".js");
            const pascalName = baseName
              .replace(/\[|\]/g, "Param")
              .replace(/(^\w|-\w)/g, (m) => m.replace("-", "").toUpperCase());
            const relRoute = toRoutePath(filePath, PAGES_DIR);
            const content = (await fs.readFile(filePath, "utf-8")).trim();
            if (!content)
              await fs.writeFile(
                filePath,
                createPageTemplate(pascalName, relRoute),
                "utf-8"
              );
            await generate();
          } else if (event === "unlink") {
            console.log(`⚠️ File removed: ${filePath}`);
            await generate();
          } else if (event === "change") {
            await generate();
          }
        });

        const ENTRY_CLIENT = path.resolve("src/entry-client.js");
        const ENTRY_SERVER = path.resolve("src/entry-server.js");

        try {
          await fs.access(ENTRY_CLIENT);
        } catch {
          await fs.writeFile(
            ENTRY_CLIENT,
            createEntryClientTemplate(),
            "utf-8"
          );
          console.log("🟢 Created default src/entry-client.js");
        }

        try {
          await fs.access(ENTRY_SERVER);
        } catch {
          await fs.writeFile(
            ENTRY_SERVER,
            createEntryServerTemplate(),
            "utf-8"
          );
          console.log("🟢 Created default src/entry-server.js");
        }

        const APP_FILE = path.resolve("src/App.js");
        try {
          await fs.access(APP_FILE);
        } catch {
          await fs.writeFile(APP_FILE, createAppTemplate(), "utf-8");
          console.log("🟢 Created default src/App.js");
        }

        chokidar.watch(ROOT_FILE).on("unlink", async () => {
          console.log(`⚠️ Root file removed: regenerating...`);
          await fs.writeFile(ROOT_FILE, createRootTemplate(), "utf-8");
        });
      }

      console.log("🟢 JS Filebased Router Generated Successfully...");
    },
  };
};

export { JSFilebasedRouter };
