import qpmsLogo from '../assets/qpms-logo.png';

export default function Logo({ className = 'h-9 w-9', showText = true, textClassName = '' }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={qpmsLogo}
        alt="myQPMS company logo"
        className={`${className} shrink-0 rounded-xl object-contain shadow-sm`}
      />
      {showText ? (
        <div className={`flex min-w-0 items-center ${textClassName}`}>
          <p className="truncate text-lg font-semibold leading-none text-slate-950 dark:text-white">
            <span className="text-qpms-600">my</span>QPMS
          </p>
        </div>
      ) : null}
    </div>
  );
}
