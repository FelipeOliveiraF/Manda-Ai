import { MostraAiMark } from "../brand/BrandIcons";

export function Brand() {
  return (
    <a className="wordmark" href="/" aria-label="Mostra aí">
      <span className="brand-mark"><MostraAiMark /></span>
      <span>Mostra aí</span>
    </a>
  );
}
