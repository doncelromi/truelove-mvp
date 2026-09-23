import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import * as DM from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { Check, ChevronDown, LogOut, Menu, MessageCircle, MoreHorizontal, Sparkles, Stethoscope, UserRound, Crown, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { DemoPill, LangToggle, ThemeToggle } from '@/components/Toggles'
import WelcomeModal from '@/components/tour/WelcomeModal'
import Tour from '@/components/tour/Tour'
import type { Role } from '@/data/types'
import { useT } from '@/lib/i18n'
import { DEFAULT_ROUTE, NAV, ROLE_INITIALS, ROLE_KICKER, ROLE_LABEL, ROLE_PERSON, type NavItem } from '@/lib/routes'
import { useSession } from '@/lib/session'
import { cn, WHATSAPP_URL } from '@/lib/utils'

const ROLE_ICON: Record<Role, typeof Crown> = { admin: Crown, psico: Stethoscope, user: UserRound }

function isActive(item: NavItem, pathname: string) {
  return pathname === item.path || pathname.startsWith(item.path + '/')
}

export function useSwitchRole() {
  const { setRole } = useSession()
  const navigate = useNavigate()
  const t = useT()
  return (r: Role) => {
    setRole(r)
    navigate(DEFAULT_ROUTE[r])
    window.scrollTo({ top: 0 })
    toast(`${t('viewing.as')} ${t(ROLE_LABEL[r])}`)
  }
}

function RoleSwitcher({ className }: { className?: string }) {
  const { role } = useSession()
  const t = useT()
  const switchRole = useSwitchRole()
  const Icon = ROLE_ICON[role]
  return (
    <DM.Root modal={false}>
      <DM.Trigger asChild>
        <button data-tour="switch-user" className={cn('btn-outline h-8 gap-1.5 px-2.5 text-[13px]', className)}>
          <Icon className="h-3.5 w-3.5 text-accent" />
          <span className="hidden 2xl:inline">{t(ROLE_LABEL[role])}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} className="fade-in z-[60] w-60 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
          <DM.Label className="label-xs px-2 pb-1.5 pt-1">{t('switch.label')}</DM.Label>
          {(['admin', 'psico', 'user'] as Role[]).map((r) => {
            const I = ROLE_ICON[r]
            return (
              <DM.Item
                key={r}
                onSelect={() => r !== role && switchRole(r)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm outline-none data-[highlighted]:bg-surface-2',
                  r === role && 'bg-accent-soft text-accent',
                )}
              >
                <I className="h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t(ROLE_LABEL[r])}</p>
                  <p className="truncate text-xs text-muted">{ROLE_PERSON[r]}</p>
                </div>
                {r === role && <Check className="h-4 w-4" />}
              </DM.Item>
            )
          })}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  )
}

function UserMenu() {
  const { role, logout } = useSession()
  const navigate = useNavigate()
  const t = useT()
  return (
    <DM.Root modal={false}>
      <DM.Trigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white ring-2 ring-accent-soft" aria-label={ROLE_PERSON[role]}>
          {ROLE_INITIALS[role]}
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} className="fade-in z-[60] w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold">{ROLE_PERSON[role]}</p>
            <p className="text-xs text-muted">{t(ROLE_LABEL[role])}</p>
          </div>
          <DM.Separator className="my-1 h-px bg-border" />
          <DM.Item
            onSelect={() => {
              logout()
              navigate('/login')
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none data-[highlighted]:bg-surface-2"
          >
            <LogOut className="h-4 w-4" /> {t('logout')}
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  )
}

function NavPills() {
  const { role } = useSession()
  const t = useT()
  const { pathname } = useLocation()
  const items = NAV[role]
  return (
    <nav data-tour="top-nav" className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
      {items.map((it, i) => {
        const active = isActive(it, pathname)
        return (
          <div key={it.id} className="flex shrink-0 items-center">
            <NavLink
              to={it.path}
              data-tour={`nav-${it.id}`}
              className={cn(
                'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium transition-colors 2xl:px-3',
                active ? 'bg-accent text-white' : i === 0 ? 'border border-accent/40 text-accent hover:bg-accent-soft' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <it.icon className={cn('h-3.5 w-3.5', i !== 0 && 'hidden 2xl:block')} />
              {t(it.label)}
            </NavLink>
            {i === 0 && <span className="mx-2 h-5 w-px bg-border" aria-hidden />}
          </div>
        )
      })}
    </nav>
  )
}

function MobileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { role, relaunchTour, logout } = useSession()
  const t = useT()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const switchRole = useSwitchRole()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fade-in fixed inset-0 z-[70] bg-black/45" />
        <Dialog.Content aria-describedby={undefined} className="slide-in-right fixed bottom-0 right-0 top-0 z-[71] flex w-[86%] max-w-sm flex-col bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title asChild>
              <div>
                <Logo />
              </div>
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1.5 text-muted hover:bg-surface-2" aria-label={t('common.close')}>
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="label-xs px-2 !text-accent">{t(ROLE_KICKER[role])}</p>
            <div className="mt-2 space-y-0.5">
              {NAV[role].map((it) => (
                <NavLink
                  key={it.id}
                  to={it.path}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium',
                    isActive(it, pathname) ? 'bg-accent text-white' : 'hover:bg-surface-2',
                  )}
                >
                  <it.icon className="h-4 w-4" />
                  {t(it.label)}
                </NavLink>
              ))}
            </div>
            <p className="label-xs mt-6 px-2">{t('switch.label')}</p>
            <div className="mt-2 grid gap-1">
              {(['admin', 'psico', 'user'] as Role[]).map((r) => {
                const I = ROLE_ICON[r]
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onOpenChange(false)
                      if (r !== role) switchRole(r)
                    }}
                    className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm', r === role ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2')}
                  >
                    <I className="h-4 w-4" />
                    <span className="flex-1">
                      <span className="block font-medium">{t(ROLE_LABEL[r])}</span>
                      <span className="block text-xs text-muted">{ROLE_PERSON[r]}</span>
                    </span>
                    {r === role && <Check className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex items-center gap-2 px-2">
              <LangToggle />
              <ThemeToggle />
              <button
                onClick={() => {
                  onOpenChange(false)
                  relaunchTour()
                }}
                className="btn-outline h-8 px-2.5 text-[13px]"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" /> {t('tour')}
              </button>
            </div>
          </div>
          <div className="space-y-3 border-t border-border p-4">
            <DemoPill />
            <p className="text-sm text-muted">{t('footer.q')}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary h-10 w-full">
              <MessageCircle className="h-4 w-4" /> {t('cta.start')}
            </a>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-fg"
              >
                <LogOut className="h-4 w-4" /> {t('logout')}
              </button>
              <span className="text-[10px] text-muted">{t('powered')}</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function BottomNav({ onMore }: { onMore: () => void }) {
  const { role } = useSession()
  const t = useT()
  const { pathname } = useLocation()
  const items = NAV[role].slice(0, 4)
  return (
    <nav data-tour="top-nav" className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {items.map((it) => {
        const active = isActive(it, pathname)
        return (
          <NavLink key={it.id} to={it.path} data-tour={`nav-${it.id}`} className="flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium">
            <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', active ? 'bg-accent text-white' : 'text-muted')}>
              <it.icon className="h-4 w-4" />
            </span>
            <span className={cn('max-w-full truncate px-1', active ? 'text-accent' : 'text-muted')}>{t(it.label)}</span>
          </NavLink>
        )
      })}
      <button onClick={onMore} className="flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium text-muted" data-tour="mobile-more">
        <span className="flex h-7 w-12 items-center justify-center rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </span>
        {t('nav.more')}
      </button>
    </nav>
  )
}

function Footer() {
  const t = useT()
  return (
    <footer className="no-print fixed inset-x-0 bottom-0 z-40 hidden h-12 items-center border-t border-border bg-surface/95 backdrop-blur lg:flex">
      <div className="flex w-full items-center gap-4 px-6">
        <DemoPill />
        <p className="text-sm text-muted">{t('footer.q')}</p>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary btn-sm h-8">
          <MessageCircle className="h-3.5 w-3.5" /> {t('cta.start')}
        </a>
        <span className="ml-auto text-[10px] text-muted">{t('powered')}</span>
      </div>
    </footer>
  )
}

export default function Shell() {
  const { role, relaunchTour, trailer } = useSession()
  const t = useT()
  const [sheet, setSheet] = useState(false)
  return (
    <div className="min-h-screen bg-bg">
      <header className="no-print sticky top-0 z-50 h-16 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 lg:px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <Logo compact />
            <div className="leading-tight">
              <p className="hidden text-[14px] font-semibold tracking-tight sm:block lg:hidden 2xl:block">Yo me quiero casar, ¿y usted?</p>
              <p className="text-[9.5px] font-bold tracking-wider text-accent">{t(ROLE_KICKER[role])}</p>
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 lg:flex">
            <NavPills />
          </div>
          <div className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex">
            <button onClick={relaunchTour} className="btn-ghost h-8 px-2 text-[13px]" data-tour="tour-btn" title={t('tour')}>
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="hidden 2xl:inline">{t('tour')}</span>
            </button>
            <LangToggle />
            <ThemeToggle />
            <RoleSwitcher />
            <a href={WHATSAPP_URL} target="_blank" rel="noopener" data-tour="whatsapp-cta" className="btn-accent-outline h-8 px-3 text-[13px]">
              <MessageCircle className="h-3.5 w-3.5" />
              {t('cta.start')}
            </a>
            <UserMenu />
          </div>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener" data-tour="whatsapp-cta" className="btn-accent-outline h-8 px-2.5 text-xs">
              <MessageCircle className="h-3.5 w-3.5" />
              {t('cta.start')}
            </a>
            <button onClick={() => setSheet(true)} data-tour="switch-user" className="btn-outline h-9 w-9 px-0" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-20 lg:pt-8">
        <Outlet />
      </main>

      <Footer />
      <BottomNav onMore={() => setSheet(true)} />
      <MobileSheet open={sheet} onOpenChange={setSheet} />
      {!trailer && <WelcomeModal />}
      {!trailer && <Tour />}
    </div>
  )
}
