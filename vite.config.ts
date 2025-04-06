import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  // Add this define section to provide process.env
  define: {
    'process.env': {},
    'process.platform': JSON.stringify(''),
    'process.version': JSON.stringify(''),
  },
  server: {
    hmr: true,
    // Add middleware to handle React DevTools source map requests
    middlewares: [
      (req, res, next) => {
        // Handle React DevTools source map requests
        if (req.url?.endsWith('.js.map') && 
            (req.url.includes('installHook') || req.url.includes('react_devtools'))) {
          res.statusCode = 204;
          return res.end();
        }
        next();
      }
    ]
  }
});

