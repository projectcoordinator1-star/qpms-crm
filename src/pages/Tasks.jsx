import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, RotateCcw, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
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

export default function Tasks() {
  const { user } = useAuth();
  const { siteVisits, decideApproval } = useWorkflow();
  const [remarks, setRemarks] = useState({});
  const financeMode = isFinanceTeam(user);
  const hrMode = isHrReviewer(user);
  const operationsMode = isOperationsTeam(user);
  const coordinatorMode = isCoordinator(user);
  const stage = operationsMode ? 'Operations Review' : coordinatorMode ? 'Coordinator Costing Review' : hrMode ? 'HR Validation' : financeMode ? 'Finance Review' : 'Commercial Review';
  const pageTitle = operationsMode ? 'Operations Review' : coordinatorMode ? 'Coordinator Costing Review' : hrMode ? 'HR Review' : financeMode ? 'Finance Review' : 'Commercial Review';
  usePageTitle(pageTitle);

  const queue = useMemo(
    () => siteVisits.filter((visit) => (visit.reviewStatus?.[stage] || ((visit.currentStage || visit.status) === stage ? 'Pending' : '')) === 'Pending'),
    [siteVisits, stage],
  );

  const pendingCount = queue.filter((visit) => !['Approved', 'Rejected', 'Rework Requested'].includes(visit.approvalStatus)).length;

  function handleDecision(visit, decision) {
    decideApproval(visit.id, decision, remarks[visit.id] || '', user, stage);
    setRemarks((current) => ({ ...current, [visit.id]: '' }));
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title={pageTitle}
        description={operationsMode ? 'Review tools, machinery, consumables, site readiness, and execution feasibility.' : coordinatorMode ? 'Consolidate manpower, reliever logic, zone logic, and costing readiness before HR validation.' : hrMode ? 'Review manpower, wage, reliever, gender, shift, and uniform details without commercial costing access.' : financeMode ? 'Review financial feasibility, billing, margins, payment terms, and commercial risk.' : 'Review BD submitted assessments for pricing, margins, management fee, and commercial statement readiness.'}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Pending approvals', pendingCount],
          ['Submitted records', queue.length],
          ['Current stage', stage],
        ].map(([label, value]) => (
          <div key={label} className="enterprise-card flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
            </div>
            <div className="rounded-2xl bg-qpms-50 p-3 text-qpms-600 dark:bg-qpms-500/10 dark:text-qpms-200">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        {queue.length ? queue.map((visit) => (
          <article key={visit.id} className="enterprise-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{visit.company}</h3>
                  <StatusBadge status={visit.approvalStatus || 'Pending'} />
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <p><span className="font-semibold text-slate-900 dark:text-white">Submitted:</span> {visit.lastApprovalAt ? new Date(visit.lastApprovalAt).toLocaleDateString() : 'Pending timestamp'}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">Pending with:</span> {visit.pendingWith || stage}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">Site assessment:</span> {visit.assessmentStatus || 'Drafted'}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">{operationsMode ? 'Execution scope' : hrMode || coordinatorMode ? 'Manpower rows' : 'Service scope'}:</span> {operationsMode ? 'Tools, equipment, consumables, machinery' : hrMode || coordinatorMode ? `${visit.survey?.manpowerPlan?.length || 0} manpower rows` : serviceScope(visit)}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">{operationsMode ? 'Site readiness' : hrMode ? 'Shift / gender review' : financeMode ? 'Billing summary' : 'Commercial statement'}:</span> {operationsMode ? 'Pending operations validation' : hrMode ? 'Visible in manpower assessment' : visit.survey?.commercialStatement || visit.survey?.commercial?.notes || 'Available in assessment record'}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">{operationsMode ? 'Machinery / consumables' : hrMode ? 'Uniform / wage review' : financeMode ? 'Margin / risk' : 'Pricing / margin'}:</span> {operationsMode ? 'Pending feasibility review' : hrMode ? 'Pending HR validation' : visit.survey?.marginAgreed || visit.survey?.paymentTerms || 'Pending reviewer validation'}</p>
                </div>
              </div>
              <div className="w-full shrink-0 space-y-3 lg:w-80">
                <textarea
                  value={remarks[visit.id] || ''}
                  onChange={(event) => setRemarks((current) => ({ ...current, [visit.id]: event.target.value }))}
                  placeholder={operationsMode ? 'Add operations remarks' : coordinatorMode ? 'Add coordinator remarks' : hrMode ? 'Add HR remarks' : financeMode ? 'Add finance remarks' : 'Add commercial remarks'}
                  className="focus-ring min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => handleDecision(visit, 'approve')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button type="button" onClick={() => handleDecision(visit, 'rework')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600">
                    <RotateCcw className="h-4 w-4" /> Rework
                  </button>
                  <button type="button" onClick={() => handleDecision(visit, 'reject')} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          </article>
        )) : (
          <section className="enterprise-card p-8 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No records are pending in {stage}.</p>
          </section>
        )}
      </section>
    </div>
  );
}
