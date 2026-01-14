import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent multiple React copies (fixes: Cannot read properties of null (reading 'useState'))
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Recharts - only loaded when needed for analytics
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // React core - always needed
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router - always needed after auth
          if (id.includes('react-router-dom') || id.includes('react-router')) {
            return 'vendor-router';
          }
          // Heavy UI components - load on demand
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-dropdown-menu') ||
              id.includes('@radix-ui/react-popover') ||
              id.includes('@radix-ui/react-select') ||
              id.includes('@radix-ui/react-tabs') ||
              id.includes('@radix-ui/react-accordion')) {
            return 'vendor-ui-heavy';
          }
          // Light UI components - tooltip, label, etc
          if (id.includes('@radix-ui/')) {
            return 'vendor-ui-light';
          }
          // Query client
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('node_modules/zod/')) {
            return 'vendor-forms';
          }
          // Supabase
          if (id.includes('@supabase/')) {
            return 'vendor-supabase';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'vendor-date';
          }
        },
      },
    },
  },
}));
