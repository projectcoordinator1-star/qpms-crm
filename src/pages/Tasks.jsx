import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../context/auth-context.js';
import { useWorkflow } from '../context/workflow-context.js';
import { isCoordinator, isFinanceTeam, isHrReviewer, isOperationsTeam } from '../data/mockUsers.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function serviceScope(visit) {
  const scope = visit.serviceScope || visit.survey?.serviceScope || visit.survey?.ifmScope;
  if (Array.isArray(scope)) return scope.join(', ');
  if (scope && typeof scope === 'object') return Object.entries(scope).filter(([, value]) => value).map(([key]) => key).join(', ');
  return 'Scope available in assessment summary';
}

const stageWaitingCopy = {
  'Operations Review': 'No pending operations reviews.',
  'Coordinator Costing Review': 'No pending coordinator reviews.',
  'HR Validation': 'No pending HR reviews.',
  'Commercial Review': 'No pending commercial reviews.',
  'Finance Review': 'No pending finance reviews.',
};

const reviewerCopy = {
  'Operations Review': {
    title: 'Operations Review',
    eyebrow: 'Execution readiness',
    description: '',
    panelTitle: 'Operations Action Panel',
    remark: 'Add operations remarks',
    sections: [
      ['Site execution feasibility', 'Tools, machinery, consumables, and readiness validation.', ShieldCheck],
      ['Operational observations', 'Review execution practicality before costing progresses.', ClipboardList],
      ['Risk notes', 'Mark site blockers, dependency gaps, and handover concerns.', AlertTriangle],
    ],
  },
  'Coordinator Costing Review': {
    title: 'Coordinator Review',
    eyebrow: 'Costing readiness',
    description: '',
    panelTitle: 'Coordinator Action Panel',
    remark: 'Add coordinator remarks',
    sections: [
      ['Manpower consolidation', 'Validate manpower rows, shifts, reliever assumptions, and zone mapping.', ClipboardList],
      ['Costing readiness', 'Prepare structured inputs for HR and commercial review.', WalletCards],
      ['Review controls', 'Confirm assessment completeness before routing forward.', FileCheck2],
    ],
  },
  'HR Validation': {
    title: 'HR Review',
    eyebrow: 'Manpower validation',
    description: '',
    panelTitle: 'HR Action Panel',
    remark: 'Add HR remarks',
    sections: [
      ['Manpower Requirement', 'Visible and editable for HR wage, shift, reliever, and gender validation.', ClipboardList],
      ['Wage feasibility', 'Review salary, statutory, reliever, and take-home assumptions.', WalletCards],
      ['Uniform and shift logic', 'Validate role coverage, gender, and shift planning controls.', ShieldCheck],
    ],
  },
  'Commercial Review': {
    title: 'Commercial Review',
    eyebrow: 'Pricing and contract readiness',
    description: '',
    panelTitle: 'Commercial Action Panel',
    remark: 'Add commercial remarks',
    sections: [
      ['Scope validation', 'Confirm selected IFM/FM scope and client operational expectation.', ClipboardList],
      ['Pricing validation', 'Review management fee, margin assumptions, and billable readiness.', Banknote],
      ['Contract terms', 'Check commercial statement, payment assumptions, and client readiness.', FileCheck2],
      ['Risk notes', 'Capture commercial risk before finance validation.', AlertTriangle],
    ],
  },
  'Finance Review': {
    title: 'Finance Review',
    eyebrow: 'Financial approval',
    description: '',
    panelTitle: 'Reviewer Action Panel',
    remark: 'Add finance remarks',
    sections: [
      ['Client Summary', 'Review client, site, and submission context before decision.', Building2],
      ['Billing Summary', 'Validate billing readiness, proposal value, and revenue assumptions.', WalletCards],
      ['Margin / Risk Review', 'Check profitability, exposure, and finance risk indicators.', AlertTriangle],
      ['Payment Terms', 'Capture payment feasibility and finance remarks.', FileCheck2],
    ],
  },
};

function reviewMeta(stage) {
  return reviewerCopy[stage] || reviewerCopy['Commercial Review'];
}

function ReviewMetricCard({ label, value, icon, tone = 'blue' }) {
  const MetricIcon = icon;
  const toneClass = {
    blue: 'bg-qpms-50 text-qpms-700 ring-qpms-200 dark:bg-qpms-500/15 dark:text-qpms-300 dark:ring-qpms-500/25',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
    red: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
  }[tone];
  return (
    <div className="enterprise-card-compact flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ring-1 ${toneClass}`}>
        <MetricIcon className="h-5 w-5" />
      </div>
    </div>
  );
}

function ReviewSectionCard({ title, description, icon }) {
  const SectionIcon = icon;
  return (
    <div className="workspace-panel p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-qpms-600 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:text-qpms-300 dark:ring-slate-800">
          <SectionIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyReviewState({ stage }) {
  return (
    <section className="enterprise-card overflow-hidden text-center">
      <div className="bg-gradient-to-br from-qpms-50 via-white to-slate-50 px-6 py-10 dark:from-qpms-500/10 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-qpms-600 shadow-sm ring-1 ring-qpms-100 dark:bg-slate-950 dark:text-qpms-300 dark:ring-qpms-500/20">
          <BadgeCheck className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No pending records in {stage}</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{stageWaitingCopy[stage]}</p>
      </div>
    </section>
  );
}

function AssessmentSnapshot({ visit, stage }) {
  const manpowerRows = visit.survey?.manpowerPlan?.length || 0;
  const commercial = visit.survey?.commercial || {};
  const financeStage = stage === 'Finance Review';
  const hrStage = stage === 'HR Validation';
  const items = hrStage
    ? [
        ['Manpower rows', manpowerRows],
        ['Applicable zone', visit.survey?.applicableZone || 'Pending'],
        ['Reliever required', visit.survey?.relieverCostRequired || 'Pending'],
        ['Wage notes', visit.survey?.wageComputationNotes || 'Pending'],
      ]
    : [
        ['Site', [visit.location, visit.city, visit.state].filter(Boolean).join(', ') || 'Pending'],
        ['Scope', serviceScope(visit)],
        ['Manpower rows', manpowerRows],
        [financeStage ? 'Payment terms' : 'Commercial statement', visit.survey?.paymentTerms || visit.survey?.commercialStatement || commercial.notes || 'Pending'],
        ['Management fee', commercial.managementFee || commercial.management_fee || 'Pending'],
        ['Proposal value', commercial.proposalValue || commercial.proposal_value || 'Pending'],
      ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const { siteVisits, decideApproval } = useWorkflow();
  const [remarks, setRemarks] = useState({});
  const [pendingDecision, setPendingDecision] = useState('');
  const [toast, setToast] = useState(null);
  const financeMode = isFinanceTeam(user);
  const hrMode = isHrReviewer(user);
  const operationsMode = isOperationsTeam(user);
  const coordinatorMode = isCoordinator(user);
  const stage = operationsMode ? 'Operations Review' : coordinatorMode ? 'Coordinator Costing Review' : hrMode ? 'HR Validation' : financeMode ? 'Finance Review' : 'Commercial Review';
  const meta = reviewMeta(stage);
  const pageTitle = meta.title;
  usePageTitle(pageTitle);

  const queue = useMemo(
    () => siteVisits.filter((visit) => (visit.reviewStatus?.[stage] || ((visit.currentStage || visit.status) === stage ? 'Pending' : '')) === 'Pending'),
    [siteVisits, stage],
  );

  const pendingCount = queue.filter((visit) => !['Approved', 'Rejected', 'Rework Requested'].includes(visit.approvalStatus)).length;

  function showToast(message, type = 'success') {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }

  async function handleDecision(visit, decision) {
    const actionKey = `${visit.id}-${decision}`;
    setPendingDecision(actionKey);
    try {
      await Promise.resolve(decideApproval(visit.id, decision, remarks[visit.id] || '', user, stage));
      setRemarks((current) => ({ ...current, [visit.id]: '' }));
      showToast(decision === 'rework' ? 'Rework requested' : decision === 'return' ? 'Returned to BD for proposal' : 'Review approved', 'success');
    } catch (error) {
      showToast(`Review action failed: ${error.message}`, 'error');
    } finally {
      setPendingDecision('');
    }
  }

  return (
    <div className="space-y-7">
      <Toast message={toast?.message} type={toast?.type} />
      <PageHeader title={pageTitle} />

      <section className="enterprise-card overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-950 to-qpms-700 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-qpms-100">{meta.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">{stage}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20">Stage: {stage}</span>
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20">Role: {user?.role || 'Reviewer'}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ReviewMetricCard label="Pending approvals" value={pendingCount} icon={Clock3} tone="amber" />
        <ReviewMetricCard label="Submitted records" value={queue.length} icon={ClipboardList} tone="blue" />
        <ReviewMetricCard label="Current stage" value={stage} icon={BadgeCheck} tone="green" />
      </section>

      <section className="space-y-4">
        {queue.length ? queue.map((visit) => (
          <article key={visit.id} className="enterprise-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/55">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{visit.company}</h3>
                  <StatusBadge status={visit.approvalStatus || 'Pending'} />
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">SLA: On Watch</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">Pending with: {visit.pendingWith || stage}</span>
                  <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">Assessment: {visit.assessmentStatus || 'Drafted'}</span>
                  <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">Submitted: {visit.lastApprovalAt ? new Date(visit.lastApprovalAt).toLocaleDateString() : 'Pending'}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_340px]">
              <div className="min-w-0 space-y-4">
                <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Client Summary</p>
                    <p className="mt-2 font-semibold text-slate-950 dark:text-white">{visit.company}</p>
                    <p className="mt-1 text-xs">Primary scope: {serviceScope(visit)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{financeMode ? 'Billing Summary' : 'Review Summary'}</p>
                    <p className="mt-2 font-semibold text-slate-950 dark:text-white">{visit.survey?.commercialStatement || visit.survey?.commercial?.notes || 'Available in assessment record'}</p>
                    <p className="mt-1 text-xs">{visit.survey?.marginAgreed || visit.survey?.paymentTerms || 'Pending reviewer validation'}</p>
                  </div>
                </div>
                <AssessmentSnapshot visit={visit} stage={stage} />
                <div className="grid gap-3 md:grid-cols-2">
                  {meta.sections.map(([title, description, Icon]) => (
                    <ReviewSectionCard key={title} title={title} description={description} icon={Icon} />
                  ))}
                </div>
              </div>
              <div className="w-full shrink-0 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950/55">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{meta.panelTitle}</p>
                </div>
                <textarea
                  value={remarks[visit.id] || ''}
                  onChange={(event) => setRemarks((current) => ({ ...current, [visit.id]: event.target.value }))}
                  placeholder={meta.remark}
                  className="focus-ring min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className={financeMode ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-2'}>
                  <button type="button" disabled={Boolean(pendingDecision)} onClick={() => handleDecision(visit, 'approve')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button type="button" disabled={Boolean(pendingDecision)} onClick={() => handleDecision(visit, 'rework')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60">
                    <RotateCcw className="h-4 w-4" /> Request Rework
                  </button>
                  {financeMode ? (
                    <button type="button" disabled={Boolean(pendingDecision)} onClick={() => handleDecision(visit, 'return')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-qpms-600 px-3 py-2 text-xs font-bold text-white hover:bg-qpms-700 disabled:cursor-not-allowed disabled:opacity-60">
                      <CheckCircle2 className="h-4 w-4" /> Return to BD
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        )) : (
          <EmptyReviewState stage={stage} />
        )}
      </section>
    </div>
  );
}
