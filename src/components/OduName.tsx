/** An Odù name in a `lang="yo"` element, honouring the diacritics display option. */
import { useApp } from '../app/AppContext';
import { displayName, displayText, getOdu } from '../logic/odu';

export function OduName({ id, className }: { id: string; className?: string }) {
  const { settings } = useApp();
  return (
    <span lang="yo" className={className}>
      {displayName(getOdu(id), settings.showDiacritics)}
    </span>
  );
}

/** Any Yoruba text, honouring the diacritics display option. */
export function Yo({ children, className }: { children: string; className?: string }) {
  const { settings } = useApp();
  return (
    <span lang="yo" className={className}>
      {displayText(children, settings.showDiacritics)}
    </span>
  );
}
