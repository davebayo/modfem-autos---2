import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True only after the first client-side render commits — gates
 * `createPortal(..., document.body)` calls so SSR output (no `document`)
 * matches the initial client paint and React doesn't warn of a hydration
 * mismatch. Implemented via `useSyncExternalStore`'s server/client snapshot
 * split rather than a `useEffect` + `setState`, since React flags the
 * latter as a synchronous-setState-in-effect anti-pattern. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
