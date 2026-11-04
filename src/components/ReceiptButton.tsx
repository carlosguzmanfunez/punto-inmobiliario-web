"use client";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

// Abre el comprobante de pago en otra pestaña. En Supabase pide un link temporal;
// en modo demo la imagen está guardada en el navegador y se abre como archivo.
export default function ReceiptButton({ receipt }: { receipt: string }) {
  const { backend } = useAuth();
  const [err, setErr] = useState("");
  const [inline, setInline] = useState("");
  return (
    <>
      <button type="button" className="link-btn" onClick={async () => {
        setErr("");
        const w = window.open("", "_blank");
        try {
          let url = await backend.receiptUrl(receipt);
          if (url.startsWith("data:")) url = URL.createObjectURL(await (await fetch(url)).blob());
          // Si el navegador bloquea la pestaña nueva, lo mostramos aquí mismo.
          if (w) w.location.href = url; else setInline(url);
        } catch (e) { w?.close(); setErr((e as Error).message); }
      }}>Ver comprobante</button>
      {err && <span className="form__error small"> {err}</span>}
      {inline && (
        <div className="receipt-view" role="dialog" aria-label="Comprobante de pago" onClick={() => setInline("")}>
          <img src={inline} alt="Comprobante de pago" />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setInline("")}>Cerrar</button>
        </div>
      )}
    </>
  );
}
