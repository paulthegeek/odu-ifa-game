/**
 * App navigation, rendered once: a top bar plus a bottom tab bar on phones,
 * a left sidebar from the md breakpoint up (md: utilities switch the layout). Hidden during a round.
 */
import { Icon, type IconName } from '../components/Icon';
import { ThemeMenu } from '../components/ThemeToggle';
import { linkButton } from '../components/ui';
import { cn } from '../lib/cn';

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
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 bg-bg pt-[max(0.5rem,env(safe-area-inset-top))] pr-3 pb-2 pl-5 md:h-dvh md:flex-col md:flex-nowrap md:items-stretch md:justify-start md:gap-7 md:border-r md:border-line md:bg-surface md:px-4 md:pt-7 md:pb-6">
      <p className="m-0 font-serif text-[1.6rem] leading-[1.2] font-semibold md:px-3 md:text-[1.9rem]">
        <span lang="yo">Mọ Odù</span>
      </p>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-2 pt-[0.35rem] pb-[calc(0.35rem+env(safe-area-inset-bottom))] md:static md:flex-1 md:border-0 md:bg-transparent md:p-0"
      >
        <ul className="m-0 grid list-none grid-cols-4 p-0 md:flex md:flex-col md:gap-1">
          {TABS.map((t) => (
            <li key={t.tab}>
              <button
                type="button"
                className={cn(
                  'group flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-[0.15rem] rounded-[14px] bg-transparent px-0 py-1 text-[0.75rem] font-semibold text-muted',
                  'aria-[current=page]:font-bold aria-[current=page]:text-accent-on-soft',
                  'md:min-h-12 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-0 md:text-[0.95rem] md:font-medium md:text-fg md:hover:bg-stage',
                  'md:aria-[current=page]:bg-accent-soft md:aria-[current=page]:font-bold md:aria-[current=page]:text-accent-on-soft md:aria-[current=page]:hover:bg-accent-soft md:hc:aria-[current=page]:shadow-[inset_0_0_0_2px_#000]',
                  'motion-safe:transition-[background-color,color] motion-safe:duration-120 motion-safe:ease-[ease]',
                )}
                aria-current={active === t.tab ? 'page' : undefined}
                onClick={() => onNavigate(t.tab)}
              >
                <span className="grid h-8 w-14 place-items-center rounded-2xl group-aria-[current=page]:bg-accent-soft md:h-auto md:w-auto md:group-aria-[current=page]:bg-transparent hc:group-aria-[current=page]:shadow-[inset_0_0_0_2px_#000]">
                  <Icon name={t.icon} />
                </span>
                <span>
                  {t.label}
                  {t.long && <span className="max-md:sr-only">{t.long}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-1 md:flex-col md:items-start md:gap-2 md:px-1">
        <button type="button" className={linkButton} onClick={onHelp}>
          How to read a sign
        </button>
        <ThemeMenu sidebar />
      </div>
    </header>
  );
}
