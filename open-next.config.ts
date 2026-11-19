import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults are deliberate: no incremental-cache override, since every page
// renders client-side from /api/store rather than via ISR, and
// enableCacheInterception stays false (its default) because next.config.ts
// turns on cacheComponents/partialPrefetching, which cache interception
// doesn't support.
export default defineCloudflareConfig();
