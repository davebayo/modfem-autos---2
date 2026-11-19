import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults are deliberate: no incremental-cache override, since every page
// renders client-side from /api/store rather than via ISR. Note that
// next.config.ts keeps cacheComponents OFF — its request-time render hangs
// under workerd (see the comment there).
export default defineCloudflareConfig();
