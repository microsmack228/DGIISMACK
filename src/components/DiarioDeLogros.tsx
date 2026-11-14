import { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Trophy } from 'lucide-react';
import {
  ACHIEVEMENTS,
  ASTRONAUT_RANKS,
  GAME_IMAGES,
  getAchievementProgress,
  getAstronautRank,
} from '../data/gameData';
import { AchievementCategory, PlayerProgress } from '../types/game';
import { BadgeIcon } from './BadgeIcon';

interface DiarioDeLogrosProps {
  progress: PlayerProgress;
  onNavigateTab: (tab: 'mando' | 'misiones' | 'logros' | 'bitacora') => void;
}

type FilterMode = 'all' | 'unlocked' | 'locked';

export function DiarioDeLogros({ progress, onNavigateTab }: DiarioDeLogrosProps) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | AchievementCategory>('Todas');
  const [imgError, setImgError] = useState(false);

  const currentRank = getAstronautRank(progress.xp);
  const nextRank = ASTRONAUT_RANKS.find((r) => r.level === currentRank.level + 1) ?? null;

  const xpIntoLevel = progress.xp - currentRank.minXp;
  const xpLevelSpan = nextRank ? nextRank.minXp - currentRank.minXp : 100;
  const rankPercent = nextRank ? Math.min(100, Math.round((xpIntoLevel / xpLevelSpan) * 100)) : 100;

  const enrichedAchievements = ACHIEVEMENTS.map((ach) => {
    const status = getAchievementProgress(ach, progress);
    const isUnlocked = progress.unlockedAchievementIds.includes(ach.id) || status.unlocked;
    return {
      ...ach,
      current: status.current,
      target: status.target,
      isUnlocked,
      unlockedAt: progress.unlockedAt[ach.id],
    };
  });

  const unlockedCount = enrichedAchievements.filter((a) => a.isUnlocked).length;

  const filteredList = enrichedAchievements.filter((ach) => {
    if (filter === 'unlocked' && !ach.isUnlocked) return false;
    if (filter === 'locked' && ach.isUnlocked) return false;
    if (categoryFilter !== 'Todas' && ach.category !== categoryFilter) return false;
    return true;
  });

  const categories: Array<'Todas' | AchievementCategory> = [
    'Todas',
    'Misiones',
    'Ciencia NASA',
    'Clima Cósmico',
    'Entrenamiento',
  ];

  return (
    <section aria-labelledby="diario-logros-heading" className="space-y-8">
      {/* Encabezado de Rango del Cadete */}
      <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Diario de Logros</span>
              <span aria-hidden="true">·</span>
              <span>Cadete {progress.cadetName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-sky-300">
                Nivel {currentRank.level} de {ASTRONAUT_RANKS.length}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <h2
                id="diario-logros-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              >
                Rango actual: {currentRank.title}
              </h2>
              <span className="font-mono tabular-nums text-base font-semibold text-amber-300">
                {progress.xp} XP totales
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {currentRank.summary}
            </p>

            {/* Barra de progreso hacia el siguiente rango */}
            <div className="pt-2 space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  {nextRank
                    ? `Próximo título: ${nextRank.title}`
                    : '¡Alcanzaste el rango máximo de la expedición!'}
                </span>
                <span className="font-mono tabular-nums text-slate-200">
                  {nextRank ? `${progress.xp} / ${nextRank.minXp} XP` : '100%'}
                </span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-700/80"
                role="progressbar"
                aria-valuenow={rankPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso hacia el siguiente rango de astronauta"
              >
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${rankPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Resumen numérico y retrato de Astro-Bot */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 items-stretch">
            <div className="flex items-center gap-4 rounded-xl border border-slate-700/80 bg-[#0d1629] p-4">
              {!imgError ? (
                <img
                  src={GAME_IMAGES.astroBot}
                  alt="Astro-Bot celebrando tus logros"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-16 w-16 rounded-lg object-cover shrink-0 border border-slate-700"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Trophy className="w-7 h-7 text-amber-300" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Insignias ganadas</p>
                <p className="font-mono tabular-nums text-2xl font-bold text-white">
                  {unlockedCount} / {ACHIEVEMENTS.length}
                </p>
                <p className="text-xs text-emerald-300 mt-0.5 font-mono tabular-nums">
                  Mejor racha: {progress.bestStreak} aciertos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Escalera de títulos de astronauta */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-3">
            Escalera de Títulos de Astronauta
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ASTRONAUT_RANKS.map((rank) => {
              const reached = progress.xp >= rank.minXp;
              const isCurrent = rank.level === currentRank.level;
              return (
                <div
                  key={rank.level}
                  className={`rounded-xl border p-3 transition-colors ${
                    isCurrent
                      ? 'border-sky-400/70 bg-sky-500/10'
                      : reached
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-slate-800 bg-[#0d1629]/60 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono tabular-nums text-slate-400">
                      Nv. {rank.level}
                    </span>
                    {reached ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-white truncate">{rank.title}</p>
                  <p className="mt-0.5 font-mono tabular-nums text-xs text-slate-400">
                    {rank.minXp} XP
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controles de filtro del Diario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-[#131d33] p-1 self-start"
          role="tablist"
          aria-label="Filtrar insignias por estado"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Todas ({ACHIEVEMENTS.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unlocked'}
            onClick={() => setFilter('unlocked')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'unlocked'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ganadas ({unlockedCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'locked'}
            onClick={() => setFilter('locked')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'locked'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Por desbloquear ({ACHIEVEMENTS.length - unlockedCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'border-sky-400 bg-sky-500/15 text-sky-200'
                  : 'border-slate-800 bg-[#131d33] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Insignias */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-10 text-center">
          <Trophy className="w-10 h-10 text-slate-500 mx-auto" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-white">
            No hay insignias en esta vista todavía
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Completa misiones o prueba el Semáforo Cósmico para seguir llenando tu diario.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setCategoryFilter('Todas');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Mostrar todas las insignias
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((ach) => {
            const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <article
                key={ach.id}
                className={`rounded-2xl border p-5 transition-colors flex flex-col justify-between gap-4 ${
                  ach.isUnlocked
                    ? 'border-amber-400/50 bg-[#15223c]'
                    : 'border-slate-800 bg-[#111a2e]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${
                      ach.isUnlocked
                        ? 'border-amber-300/60 bg-amber-400/15 text-amber-300'
                        : 'border-slate-700 bg-slate-900 text-slate-500'
                    }`}
                  >
                    <BadgeIcon name={ach.iconName} className="w-7 h-7" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{ach.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-amber-300">
                        +{ach.xpBonus} XP
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          ach.isUnlocked ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {ach.isUnlocked ? 'Desbloqueada' : 'Pendiente'}
                      </span>
                    </div>

                    <h3 className="mt-1 text-lg font-bold text-white">{ach.title}</h3>
                    <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                      {ach.isUnlocked ? ach.description : `Requisito: ${ach.requirementText}`}
                    </p>
                  </div>
                </div>

                {/* Progreso hacia el logro y botón de acción */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {ach.isUnlocked
                        ? `Meta cumplida (${ach.target}/${ach.target})`
                        : `Progreso actual`}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      {ach.current} / {ach.target}
                    </span>
                  </div>

                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-slate-900"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de ${ach.title}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.isUnlocked ? 'bg-amber-400' : 'bg-sky-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {!ach.isUnlocked ? (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onNavigateTab(ach.targetTab)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>
                          {ach.targetTab === 'mando'
                            ? 'Ir al Semáforo Cósmico'
                            : 'Ir a entrenar en Misiones'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center justify-between text-xs text-emerald-300">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Insignia guardada en tu expediente espacial
                      </span>
                      {ach.unlockedAt && (
                        <span className="font-mono tabular-nums text-slate-400">
                          {ach.unlockedAt}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
