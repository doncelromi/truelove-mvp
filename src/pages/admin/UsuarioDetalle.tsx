import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Check, CirclePause, CirclePlay, MapPin, X } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { Facts, Gallery, PsicoTags, QuestionnaireAnswers, RejectModal, Section, Songs } from '@/components/MemberSections'
import { PreviewBanner } from '@/components/Notices'
import { Empty, PageHeader, PagoBadge, StatusBadge } from '@/components/ui'
import { INTERVIEW_ESTADOS, MODALIDAD, PROFESIONES, RESULTADOS, TX_ESTADOS, tx } from '@/data/catalog'
import { psicoById } from '@/data/members'
import { useMemberActions } from '@/lib/actions'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'

export default function UsuarioDetalle() {
  const { id = '' } = useParams()
  const tr = useTr()
  const { lang } = useLang()
  const { byId, interviews, transactions } = useStore()
  const { approve, pause } = useMemberActions()
  const [rejectOpen, setRejectOpen] = useState(false)
  const m = byId(id)
  if (!m) return <Empty text={tr('Miembro no encontrado.', 'Member not found.')} />
  const ivs = interviews.filter((i) => i.memberId === m.id)
  const txs = transactions.filter((t) => t.memberId === m.id)
  const fmt = (d: string) => format(new Date(d), "d MMM yyyy · HH:mm", { locale: dateLocale(lang) })

  const history = [
    { d: m.fechaAlta, t: tr('Creó su cuenta y verificó el email', 'Created account and verified email') },
    ...txs.map((t) => ({ d: t.fecha, t: `${tr('Pago de membresía', 'Membership payment')} · ${tx(TX_ESTADOS, t.estado, lang)}` })),
    ...ivs.map((i) => ({ d: i.fecha, t: `${tr('Entrevista', 'Interview')} · ${tx(INTERVIEW_ESTADOS, i.estado, lang)}${i.resultado ? ` · ${tx(RESULTADOS, i.resultado, lang)}` : ''}` })),
  ].sort((a, b) => b.d.localeCompare(a.d))

  return (
    <div>
      <Link to="/admin/usuarios" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> {tr('Volver a usuarios', 'Back to members')}
      </Link>
      <PageHeader title={tr('Ficha del miembro', 'Member profile')} subtitle={tr('Toda la información del candidato en un solo lugar.', 'All the candidate’s information in one place.')} />
      <PreviewBanner
        id="admin-usuario-detalle"
        bullets={[
          tr('Ficha completa con fotos, música, valores y cuestionario.', 'Full profile with photos, music, values and questionnaire.'),
          tr('Notas de entrevista e historial auditado.', 'Interview notes and audited history.'),
          tr('Decisión de aprobación con motivo y reembolso automático.', 'Approval decision with reason and automatic refund.'),
        ]}
      />

      <div className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <MemberPhoto member={m} size="xl" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {m.nombre} {m.apellido}, <span className="num">{m.edad}</span>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            {PROFESIONES[m.profesion]?.[lang]} · <MapPin className="h-3.5 w-3.5" /> {m.ciudad}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={m.estado} />
            <PagoBadge pago={m.pago} />
            <span className="chip border border-border text-muted">{psicoById(m.psicologaId).nombre}</span>
            <span className="chip border border-border text-muted">
              {tr('Perfil', 'Profile')} <span className="num">{m.completitud}%</span>
            </span>
          </div>
          <div className="mt-2"><PsicoTags member={m} /></div>
          {m.estado === 'rechazado' && m.motivoRechazo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{tr('Motivo', 'Reason')}: {m.motivoRechazo[lang]}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col">
          {m.estado !== 'aprobado' && m.estado !== 'pausa' && (
            <button className="btn bg-green-600 text-white hover:bg-green-700" onClick={() => approve(m)}>
              <Check className="h-4 w-4" /> {tr('Aprobar', 'Approve')}
            </button>
          )}
          {m.estado !== 'rechazado' && (
            <button className="btn-outline text-red-600" onClick={() => setRejectOpen(true)}>
              <X className="h-4 w-4" /> {tr('Rechazar', 'Reject')}
            </button>
          )}
          {(m.estado === 'aprobado' || m.estado === 'pausa') && (
            <button className="btn-outline" onClick={() => pause(m)}>
              {m.estado === 'pausa' ? <CirclePlay className="h-4 w-4" /> : <CirclePause className="h-4 w-4" />}
              {m.estado === 'pausa' ? tr('Reactivar', 'Reactivate') : tr('Pausar', 'Pause')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section title={tr('Galería de fotos', 'Photo gallery')} subtitle={tr('Subidas por el propio miembro', 'Uploaded by the member')}>
          <Gallery member={m} />
        </Section>
        <Section title={tr('Canciones que lo representan', 'Songs that represent them')}>
          <Songs member={m} />
        </Section>
        <Section title={tr('Valores y proyecto de vida', 'Values and life plan')}>
          <Facts member={m} />
        </Section>
        <Section title={tr('Biografía e historia', 'Bio and history')}>
          <p className="text-sm leading-relaxed">{m.bio[lang] || '—'}</p>
          <p className="label-xs mt-4">{tr('Historia de relaciones', 'Relationship history')}</p>
          <p className="mt-1 text-sm text-muted">{m.historia[lang]}</p>
          <p className="label-xs mt-4">{tr('Aspiraciones', 'Aspirations')}</p>
          <p className="mt-1 text-sm text-muted">{m.aspiraciones[lang]}</p>
        </Section>
        <Section title={tr('Cuestionario psicológico', 'Psychological questionnaire')}>
          <QuestionnaireAnswers member={m} />
        </Section>
        <div className="space-y-4">
          <Section title={tr('Notas de entrevista', 'Interview notes')}>
            {ivs.length === 0 ? (
              <Empty text={tr('Sin entrevistas todavía.', 'No interviews yet.')} />
            ) : (
              <ul className="space-y-3">
                {ivs.map((i) => (
                  <li key={i.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                      <span>{fmt(i.fecha)} · {tx(MODALIDAD, i.modalidad, lang)}</span>
                      <span>{psicoById(i.psicologaId).nombre}</span>
                    </div>
                    <p className="mt-1.5 text-sm">{i.notas?.[lang] ?? tx(INTERVIEW_ESTADOS, i.estado, lang)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title={tr('Historial', 'History')}>
            <ol className="relative space-y-3 border-l border-border pl-4">
              {history.map((h, k) => (
                <li key={k} className="text-sm">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                  <p>{h.t}</p>
                  <p className="text-xs text-muted">{fmt(h.d)}</p>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
      <RejectModal member={m} open={rejectOpen} onOpenChange={setRejectOpen} />
    </div>
  )
}
