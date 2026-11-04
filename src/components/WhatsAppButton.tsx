import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

export default function WhatsAppButton() {
  return (
    <a className="wa-float" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
      <WhatsAppIcon size={30} />
      <span className="wa-float__label">¿Te ayudamos?</span>
    </a>
  );
}
