import { go, useLocation } from "./router";
export function useRouter() {
  return { push: (h: string) => { go(h); scrollTo(0, 0); }, replace: (h: string) => go(h, true), back: () => history.back(), refresh: () => {} };
}
export function useSearchParams() { return new URLSearchParams(useLocation().query); }
export function usePathname() { return useLocation().path; }
export function notFound(): never { throw new Error("not found"); }
