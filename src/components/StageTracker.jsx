import { Check } from 'lucide-react';

export default function StageTracker({ stages, currentStage }) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center">
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    'grid h-9 w-9 place-items-center rounded-full border text-xs font-bold transition',
                    isComplete
                      ? 'border-qpms-600 bg-qpms-600 text-white'
                      : isCurrent
                        ? 'border-qpms-300 bg-qpms-50 text-qpms-700 ring-4 ring-qpms-100'
                        : 'border-slate-200 bg-white text-slate-400',
                  ].join(' ')}
                >
                  {isComplete ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={[
                    'max-w-28 text-center text-xs font-semibold leading-4',
                    isCurrent ? 'text-qpms-700' : 'text-slate-500',
                  ].join(' ')}
                >
                  {stage}
                </span>
              </div>
              {index < stages.length - 1 ? (
                <div className={`mx-2 h-px w-12 ${index < currentIndex ? 'bg-qpms-500' : 'bg-slate-200'}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
