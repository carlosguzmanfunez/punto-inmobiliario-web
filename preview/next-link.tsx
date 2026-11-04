import type { AnchorHTMLAttributes } from "react";
export default function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const internal = href.startsWith("/");
  return <a {...rest} href={internal ? "#" + href : href} onClick={(e) => { rest.onClick?.(e); if (internal && !e.defaultPrevented) { e.preventDefault(); go(href); scrollTo(0, 0); } }}>{children}</a>;
}
import { go } from "./router";
