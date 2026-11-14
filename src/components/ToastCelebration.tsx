import { Award, CheckCircle2, Sparkles, X } from 'lucide-react';
import { CelebrationNotification } from '../types/game';

interface ToastCelebrationProps {
  notifications: CelebrationNotification[];
  onDismiss: (id: string) => void;
  onOpenJournal: () => void;
}

export function ToastCelebration({
  notifications,
  onDismiss,
  onOpenJournal,
}: ToastCelebrationProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones de logros"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {notifications.map((item) => {
        const isRank = item.type === 'rank';
        const isMission = item.type === 'mission';

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto rounded-xl border border-amber-400/40 bg-[#131f38] p-4 shadow-xl transition-transform duration-200"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                  isRank
                    ? 'border-sky-400/40 bg-sky-500/15 text-sky-300'
                    : isMission
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-amber-400/40 bg-amber-500/15 text-amber-300'
                }`}
              >
                {isRank ? (
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                ) : isMission ? (
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Award className="w-5 h-5" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-amber-300">
                    {isRank
                      ? 'Nuevo rango espacial'
                      : isMission
                        ? 'Misión completada'
                        : 'Insignia desbloqueada'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    aria-label="Cerrar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="mt-0.5 text-base font-bold text-white">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-300 leading-snug">{item.message}</p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  {typeof item.xp === 'number' && item.xp > 0 ? (
                    <span className="font-mono tabular-nums text-xs font-semibold text-emerald-300">
                      +{item.xp} XP ganados
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onDismiss(item.id);
                      onOpenJournal();
                    }}
                    className="text-xs font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    Ver Diario de Logros
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
