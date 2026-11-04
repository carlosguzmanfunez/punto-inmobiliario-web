// Enrutador mínimo por "#" para la vista previa (reemplaza next/link y next/navigation).
import { useEffect, useState } from "react";

// "#/vender?x=1#planes" → ruta /vender, query x=1, ancla planes.
const read = () => {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [h, anchor = ""] = raw.split("#");
  const [path, query = ""] = h.split("?");
  return { path: path.replace(/\/$/, "") || "/", query, anchor };
};

export function useLocation() {
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const f = () => { setLoc(read()); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return loc;
}

export const go = (href: string, replace = false) => {
  const target = "#" + href;
  if (replace) history.replaceState(null, "", target); else history.pushState(null, "", target);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};
