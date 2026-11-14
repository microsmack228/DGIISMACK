import { useState } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { SCIENCE_LOG_ENTRIES } from '../data/gameData';
import { PlayerProgress } from '../types/game';

interface BitacoraNASAProps {
  progress: PlayerProgress;
  onExploreLog: (logId: string) => void;
}

export function BitacoraNASA({ progress, onExploreLog }: BitacoraNASAProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <section aria-labelledby="bitacora-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-300">
            Datos abiertos · NASA y Agencia Espacial Canadiense
          </p>
          <h2 id="bitacora-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            Bitácora Científica de la Misión
          </h2>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Descubre de dónde salen los datos reales que protegen a los astronautas. Lee cada ficha para sumar puntos de entrenamiento.
          </p>
        </div>

        <p className="font-mono tabular-nums text-sm text-slate-300 whitespace-nowrap shrink-0">
          Fichas leídas: {progress.exploredLogIds.length} / {SCIENCE_LOG_ENTRIES.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCIENCE_LOG_ENTRIES.map((entry) => {
          const isRead = progress.exploredLogIds.includes(entry.id);
          const hasErr = imgErrors[entry.id];

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-slate-800 bg-[#131d33] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-48 w-full bg-slate-900 overflow-hidden">
                  {!hasErr ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setImgErrors((prev) => ({ ...prev, [entry.id]: true }))}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400">
                      <BookOpen className="w-10 h-10" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-sky-300">{entry.agency}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.dataset}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{entry.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{entry.summary}</p>

                  <div className="rounded-xl border border-slate-700/80 bg-[#0d1629] p-4">
                    <p className="text-xs font-semibold text-amber-300">Dato curioso de Astro-Bot</p>
                    <p className="mt-1 text-sm text-slate-200 leading-relaxed">{entry.kidFact}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isRead ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {isRead ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Dato explorado
                    </>
                  ) : (
                    'Pendiente de lectura'
                  )}
                </span>

                <button
                  type="button"
                  disabled={isRead}
                  onClick={() => onExploreLog(entry.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    isRead
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                  }`}
                >
                  {isRead ? 'Registrado (+15 XP)' : 'Marcar como leído (+15 XP)'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
