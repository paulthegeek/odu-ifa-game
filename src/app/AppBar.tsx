/**
 * App navigation, rendered once: a top bar plus a bottom tab bar on phones,
 * a left sidebar on wide screens (CSS switches the layout). Hidden during a round.
 */
import { Icon, type IconName } from '../components/Icon';
import { ThemeMenu } from '../components/ThemeToggle';

export type Tab = 'home' | 'reference' | 'progress' | 'settings';

const TABS: { tab: Tab; label: string; long?: string; icon: IconName }[] = [
  { tab: 'home', label: 'Practice', icon: 'practice' },
  { tab: 'reference', label: 'Odù', long: ' reference', icon: 'book' },
  { tab: 'progress', label: 'Progress', icon: 'chart' },
  { tab: 'settings', label: 'Settings', icon: 'settings' },
];

export function AppBar({
  active,
  onNavigate,
  onHelp,
}: {
  active: Tab | null;
  onNavigate: (tab: Tab) => void;
  onHelp: () => void;
}) {
  return (
    <header className="app-bar">
      <p className="wordmark">
        <span lang="yo">Odù</span>
      </p>
      <nav aria-label="Main" className="app-nav">
        <ul>
          {TABS.map((t) => (
            <li key={t.tab}>
              <button
                type="button"
                className="nav-item"
                aria-current={active === t.tab ? 'page' : undefined}
                onClick={() => onNavigate(t.tab)}
              >
                <span className="nav-icon">
                  <Icon name={t.icon} />
                </span>
                <span className="nav-label">
                  {t.label}
                  {t.long && <span className="nav-long">{t.long}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="app-tools">
        <button type="button" className="btn-link help-link" onClick={onHelp}>
          How to read a sign
        </button>
        <ThemeMenu />
      </div>
    </header>
  );
}
