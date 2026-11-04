import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { useLocation } from "./router";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyDetail from "@/components/PropertyDetail";
import Home from "@/app/page";
import Propiedades from "@/app/propiedades/page";
import Ingresar from "@/app/ingresar/page";
import Cuenta from "@/app/cuenta/page";
import Admin from "@/app/admin/page";
import Editor from "@/app/admin/propiedad/page";
import Contacto from "@/app/contacto/page";
import Extranjero from "@/app/extranjero/page";
import Financiamiento from "@/app/financiamiento/page";
import Quienes from "@/app/quienes-somos/page";
import Vender from "@/app/vender/page";
import NotFound from "@/app/not-found";
import Panel from "@/app/panel/page";
import PanelEditor from "@/app/panel/propiedad/page";
import SellerPage from "@/components/SellerPage";

const routes: Record<string, () => React.ReactNode> = {
  "/": Home, "/propiedades": Propiedades, "/ingresar": Ingresar, "/cuenta": Cuenta, "/admin": Admin,
  "/admin/propiedad": Editor, "/contacto": Contacto, "/extranjero": Extranjero, "/financiamiento": Financiamiento,
  "/quienes-somos": Quienes, "/vender": Vender, "/panel": Panel, "/panel/propiedad": PanelEditor,
};

function App() {
  const { path } = useLocation();
  // Cierra el menú móvil al navegar.
  useEffect(() => { const t = document.getElementById("nav-toggle") as HTMLInputElement | null; if (t) t.checked = false; }, [path]);
  const m = path.match(/^\/propiedades\/([^/]+)$/);
  const v = path.match(/^\/vendedores\/([^/]+)$/);
  const Page = routes[path];
  return (
    <AuthProvider>
      <Header />
      <main key={path}>{m ? <PropertyDetail slug={decodeURIComponent(m[1])} /> : v ? <SellerPage slug={decodeURIComponent(v[1])} /> : Page ? <Page /> : <NotFound />}</main>
      <Footer />
      <WhatsAppButton />
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
