import type { ReactNode } from "react";
import { X } from "lucide-react";

export function CloseButton({ modal, id, label = "Fechar" }: { modal?: string; id?: string; label?: string }) {
  return <button className="modal-close" type="button" id={id} data-close={modal} aria-label={label}><X /></button>;
}

export function SettingsHeading({ icon, title, description }: { icon: ReactNode; title: string; description: ReactNode }) {
  return <div className="settings-heading"><span className="settings-heading-icon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>;
}
