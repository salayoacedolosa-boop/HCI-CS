import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname),
  base: "./",
  envDir: __dirname,
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        root: resolve(__dirname, "index.html"),
        index: resolve(__dirname, "EMERGENCY/html/index.html"),
        home: resolve(__dirname, "EMERGENCY/html/home.html"),
        login: resolve(__dirname, "EMERGENCY/html/login.html"),
        history: resolve(__dirname, "EMERGENCY/html/history.html"),
        contact: resolve(__dirname, "EMERGENCY/html/contact.html"),
        menu: resolve(__dirname, "EMERGENCY/html/menu.html"),
        settings: resolve(__dirname, "EMERGENCY/html/settings.html"),
        "home-pane": resolve(__dirname, "EMERGENCY/html/home-pane.html"),
        "history-pane": resolve(__dirname, "EMERGENCY/html/history-pane.html"),
        "settings-pane": resolve(
          __dirname,
          "EMERGENCY/html/settings-pane.html",
        ),
        "contact-pane": resolve(__dirname, "EMERGENCY/html/contact-pane.html"),
        loading: resolve(__dirname, "EMERGENCY/html/loading page.html"),
        "admin-login": resolve(__dirname, "ADMIN SIDE/html/login.html"),
        "admin-menu": resolve(__dirname, "ADMIN SIDE/html/menu.html"),
        "admin-map": resolve(__dirname, "ADMIN SIDE/html/map.html"),
        "admin-incidents": resolve(__dirname, "ADMIN SIDE/html/incidents.html"),
        "admin-responders": resolve(
          __dirname,
          "ADMIN SIDE/html/responders.html",
        ),
        "admin-reports": resolve(__dirname, "ADMIN SIDE/html/reports.html"),
        "admin-settings": resolve(__dirname, "ADMIN SIDE/html/settings.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: "/EMERGENCY/html/index.html",
  },
});
