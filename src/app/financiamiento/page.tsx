import { whatsappLink } from "@/lib/site";
import { BankIcon, WhatsAppIcon } from "@/components/Icons";
import MortgageCalc from "@/components/MortgageCalc";
import PageHeroMedia from "@/components/PageHeroMedia";
import { photos } from "@/data/photos";

export const metadata = { title: "Financiamiento" };

// Cuota mensual con amortización francesa.
function monthly(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12, n = years * 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
const fmt = (n: number) => `L ${new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(n)}`;

const prices = [1500000, 2500000, 3500000, 5000000];
const RATE = 0.11; // tasa de referencia para el ejemplo
const DOWN = 0.1;

export default function FinancingPage() {
  return (
    <>
      <section className="page-hero page-hero--media">
        <div className="container page-hero__grid">
          <div className="page-hero__text">
            <span className="eyebrow">Financiamiento</span>
            <h1>Tu casa propia, con una cuota que sí puedes pagar</h1>
            <p>Te orientamos para comparar préstamos de bancos y cooperativas, y preparar tus documentos sin costo adicional.</p>
          </div>
          <PageHeroMedia src={photos.casaFamiliar} icon={<BankIcon size={20} />} title="Bancos y cooperativas" text="Te ayudamos a comparar opciones" />
        </div>
      </section>
      <section id="calculadora" className="section container">
        <h2>Calcula tu cuota</h2>
        <p className="muted">Mueve la prima, la tasa y el plazo para ver cuánto pagarías al mes.</p>
        <MortgageCalc price={2500000} currency="HNL" />
      </section>
      <section className="section container">
        <h2>Cuotas de referencia</h2>
        <p className="muted">Ejemplo con prima del 10 % y tasa anual de {RATE * 100} %. Las tasas reales dependen de cada institución y tu perfil.</p>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Precio</th><th>Prima (10 %)</th><th>15 años</th><th>20 años</th><th>25 años</th></tr></thead>
            <tbody>
              {prices.map((p) => {
                const loan = p * (1 - DOWN);
                return (
                  <tr key={p}>
                    <td><strong>{fmt(p)}</strong></td>
                    <td>{fmt(p * DOWN)}</td>
                    <td>{fmt(monthly(loan, RATE, 15))}</td>
                    <td>{fmt(monthly(loan, RATE, 20))}</td>
                    <td>{fmt(monthly(loan, RATE, 25))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section id="bancos" className="section section--tint">
        <div className="container services">
          <div className="service"><h3>Préstamo bancario</h3><p>Plazos de hasta 25 o 30 años con bancos del sistema financiero nacional.</p></div>
          <div className="service"><h3>Vivienda con fondos de pensiones</h3><p>Si cotizas en un instituto de previsión, podrías acceder a tasas preferenciales.</p></div>
          <div className="service"><h3>Financiamiento directo</h3><p>Algunos desarrolladores ofrecen pagar la prima en cuotas durante la construcción.</p></div>
        </div>
      </section>
      <section id="requisitos" className="section container narrow">
        <h2>Requisitos comunes</h2>
        <ul className="checklist">
          <li>Identidad o pasaporte vigente</li>
          <li>Constancia de trabajo o ingresos de los últimos 6 meses</li>
          <li>Estados de cuenta bancarios recientes</li>
          <li>Historial crediticio sin moras</li>
          <li>Para residentes en el extranjero: comprobante de ingresos del país donde vives</li>
        </ul>
        <a className="btn btn--wa btn--lg" href={whatsappLink("Hola, quiero asesoría para financiar una propiedad.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={20} /> Pedir asesoría de financiamiento</a>
      </section>
    </>
  );
}
