import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Flame,
  RotateCcw,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BitacoraNASA } from './components/BitacoraNASA';
import { CadetGuideOverlay, GuideStep } from './components/CadetGuideOverlay';
import { DiarioDeLogros } from './components/DiarioDeLogros';
import { MissionTrainer } from './components/MissionTrainer';
import { RPGCabinStage } from './components/RPGCabinStage';
import { ToastCelebration } from './components/ToastCelebration';
import {
  ACHIEVEMENTS,
  MISSIONS,
  SPACE_WEATHER_MOCK_DATA,
  getAchievementProgress,
  getAstronautRank,
} from './data/gameData';
import {
  CelebrationNotification,
  Mission,
  PlayerProgress,
  SpaceWeatherLevel,
  SuitColor,
} from './types/game';
import { soundFx } from './utils/soundFx';

type ActiveTab = 'mando' | 'misiones' | 'logros' | 'bitacora';

const STORAGE_KEY = 'guardianes_escudo_progress_v1';

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-rpg',
    targetSelector: '[data-guide-id="rpg-stage"]',
    title: '¡Bienvenido al Puente RPG!',
    description:
      'Aquí manejas a tu Cadete Astronauta junto a Astro-Bot. Personaliza tu nombre, cambia el color de tu traje y muévete con las flechas, WASD, botones o clic.',
    actionTip: 'Recoge los cristales flotantes (+10 XP) y acércate a las 5 estaciones de la cabina.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-semaforo',
    targetSelector: '[data-guide-id="semaforo"]',
    title: 'El Semáforo Cósmico',
    description:
      'Muestra el clima espacial usando datos simulados de la NASA (CCMC DONKI y RadLab) con tres luces: Verde (calma), Amarillo (viento solar) y Rojo (tormenta).',
    actionTip: 'Haz clic en los 3 círculos para revisarlos y desbloquear la insignia Vigilante Solar.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-misiones',
    targetSelector: '[data-guide-id="nav-misiones"]',
    title: 'Misiones de la Luna a Marte',
    description:
      'En esta sección superarás prácticas interactivas de cabina (escudo magnético, invernadero Veggie, cocina sin migajas y ejercicio) y preguntas científicas.',
    actionTip: 'Cada misión completada aumenta tus atributos RPG y te acerca a Marte.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-logros',
    targetSelector: '[data-guide-id="nav-logros"]',
    title: 'Tu Diario de Logros',
    description:
      'Aquí coleccionas tus 10 insignias espaciales, revisas tus rangos desde Cadete Lunar hasta Comandante Guardián y ves qué te falta para el próximo premio.',
    actionTip: 'Abre el diario siempre que desbloquees una medalla nueva.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-bitacora',
    targetSelector: '[data-guide-id="nav-bitacora"]',
    title: 'Bitácora Científica NASA',
    description:
      'Descubre las fuentes reales de la NASA y de la Agencia Espacial Canadiense (CSA) que inspiran cada desafío del juego.',
    actionTip: 'Lee cada ficha científica para sumar +15 XP extra.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-kpis',
    targetSelector: '[data-guide-id="kpi-strip"]',
    title: 'Tu Expediente de Astronauta',
    description:
      'Consulta en todo momento tu rango actual, puntos XP, misiones superadas y racha de respuestas correctas seguidas.',
    actionTip: 'Puedes volver a abrir esta guía cuando quieras desde el botón Guía del Cadete.',
    preferredPlacement: 'top',
  },
];

const INITIAL_PROGRESS: PlayerProgress = {
  cadetName: 'Explorador',
  suitColor: 'sky',
  hasSeenGuide: false,
  deckInteractions: [],
  orbsCollected: 0,
  xp: 0,
  completedMissionIds: [],
  correctQuestionIds: [],
  exploredLogIds: [],
  inspectedWeatherLevels: ['green'],
  bestStreak: 0,
  currentStreak: 0,
  completedMiniLabs: [],
  unlockedAchievementIds: [],
  unlockedAt: {},
};

function loadInitialProgress(): PlayerProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      inspectedWeatherLevels:
        parsed.inspectedWeatherLevels && parsed.inspectedWeatherLevels.length > 0
          ? parsed.inspectedWeatherLevels
          : ['green'],
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

interface SemaforoCosmicoProps {
  activeLevel: SpaceWeatherLevel;
  inspectedLevels: SpaceWeatherLevel[];
  onSelectLevel: (level: SpaceWeatherLevel) => void;
}

/**
 * Semáforo Cósmico: renderiza tres círculos (Verde, Amarillo y Rojo)
 * que representan el estado actual del clima espacial con datos simulados de la NASA.
 */
export function SemaforoCosmico({
  activeLevel,
  inspectedLevels,
  onSelectLevel,
}: SemaforoCosmicoProps) {
  const scenario = SPACE_WEATHER_MOCK_DATA[activeLevel];

  const lights: Array<{
    level: SpaceWeatherLevel;
    name: string;
    stateTag: string;
    circleActiveClass: string;
    circleIdleClass: string;
    icon: typeof CheckCircle2;
  }> = [
    {
      level: 'green',
      name: 'Verde',
      stateTag: 'Nominal',
      circleActiveClass:
        'bg-emerald-500 border-emerald-200 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.45)] scale-105',
      circleIdleClass: 'bg-emerald-950/60 border-emerald-800/70 text-emerald-400/70 hover:border-emerald-500',
      icon: CheckCircle2,
    },
    {
      level: 'yellow',
      name: 'Amarillo',
      stateTag: 'Precaución',
      circleActiveClass:
        'bg-amber-400 border-amber-100 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.45)] scale-105',
      circleIdleClass: 'bg-amber-950/60 border-amber-800/70 text-amber-400/70 hover:border-amber-400',
      icon: AlertTriangle,
    },
    {
      level: 'red',
      name: 'Rojo',
      stateTag: 'Tormenta',
      circleActiveClass:
        'bg-rose-500 border-rose-200 text-white shadow-[0_0_24px_rgba(244,63,94,0.5)] scale-105',
      circleIdleClass: 'bg-rose-950/60 border-rose-800/70 text-rose-400/70 hover:border-rose-500',
      icon: ShieldAlert,
    },
  ];

  return (
    <div
      data-guide-id="semaforo"
      aria-labelledby="semaforo-cosmico-title"
      className="rounded-2xl border border-slate-800 bg-[#131d33] p-6 space-y-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Telemetría · {scenario.source}
          </p>
          <h2 id="semaforo-cosmico-title" className="mt-0.5 text-xl font-bold text-white">
            Semáforo Cósmico
          </h2>
        </div>
        <span className="font-mono tabular-nums text-xs text-sky-300">
          Niveles revisados: {inspectedLevels.length} / 3
        </span>
      </div>

      {/* Tres círculos interactivos del Semáforo Cósmico (Verde, Amarillo, Rojo) */}
      <div className="rounded-xl border border-slate-800 bg-[#0b1221] p-5">
        <div
          className="grid grid-cols-3 gap-4 items-center justify-items-center"
          role="group"
          aria-label="Selector de estado del Semáforo Cósmico"
        >
          {lights.map((light) => {
            const isActive = activeLevel === light.level;
            const Icon = light.icon;
            return (
              <button
                key={light.level}
                type="button"
                onClick={() => onSelectLevel(light.level)}
                aria-pressed={isActive}
                aria-label={`Semáforo Cósmico ${light.name}: ${light.stateTag}`}
                className="group flex flex-col items-center gap-2.5 focus:outline-none"
              >
                <span
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isActive ? light.circleActiveClass : light.circleIdleClass
                  }`}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
                </span>
                <span className="text-center">
                  <span
                    className={`block text-sm font-bold ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {light.name}
                  </span>
                  <span className="block text-xs text-slate-400">{light.stateTag}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lectura de estado y telemetría simulada */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={`text-sm font-bold ${
              activeLevel === 'green'
                ? 'text-emerald-300'
                : activeLevel === 'yellow'
                  ? 'text-amber-300'
                  : 'text-rose-300'
            }`}
          >
            Estado actual: {scenario.label}
          </p>
          <span className="text-xs text-slate-400">{scenario.shortStatus}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-[#0d1629] p-3">
            <p className="text-xs text-slate-400">Viento solar</p>
            <p className="mt-1 font-mono tabular-nums text-base font-bold text-white">
              {scenario.solarWindKms} <span className="text-xs font-normal text-slate-400">km/s</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0d1629] p-3">
            <p className="text-xs text-slate-400">Índice Kp</p>
            <p className="mt-1 font-mono tabular-nums text-base font-bold text-white">
              Kp {scenario.kpIndex} <span className="text-xs font-normal text-slate-400">/ 9</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0d1629] p-3">
            <p className="text-xs text-slate-400">Radiación</p>
            <p className="mt-1 font-mono tabular-nums text-base font-bold text-white">
              {scenario.radiationMsvDay.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">mSv/d</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0d1629] p-3">
            <p className="text-xs text-slate-400">Protones</p>
            <p className="mt-1 font-mono tabular-nums text-sm font-bold text-white truncate">
              {scenario.protonFlux}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1629] p-4 space-y-1.5">
          <p className="text-xs font-semibold text-sky-300">Consejo de Astro-Bot</p>
          <p className="text-sm text-slate-200 leading-relaxed">{scenario.astroBotAdvice}</p>
          <p className="text-xs text-slate-400 pt-1">
            Protocolo de tripulación: {scenario.crewProtocol}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mando');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [weatherLevel, setWeatherLevel] = useState<SpaceWeatherLevel>('green');
  const [progress, setProgress] = useState<PlayerProgress>(loadInitialProgress);
  const [notifications, setNotifications] = useState<CelebrationNotification[]>([]);
  const [muted, setMuted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(() => !loadInitialProgress().hasSeenGuide);
  const [guideStepIndex, setGuideStepIndex] = useState(0);

  const prevUnlockedRef = useRef<string[]>(progress.unlockedAchievementIds);
  const prevRankLevelRef = useRef<number>(getAstronautRank(progress.xp).level);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignorar errores de almacenamiento en modo privado
    }
  }, [progress]);

  const pushNotification = (note: Omit<CelebrationNotification, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications((prev) => [...prev.slice(-2), { ...note, id }]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 6500);
  };

  useEffect(() => {
    const prevUnlocked = prevUnlockedRef.current;
    const newlyUnlocked = progress.unlockedAchievementIds.filter(
      (id) => !prevUnlocked.includes(id)
    );
    const currentRankObj = getAstronautRank(progress.xp);

    if (newlyUnlocked.length > 0) {
      soundFx.playUnlock();
      for (const id of newlyUnlocked) {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) {
          pushNotification({
            type: 'achievement',
            title: def.title,
            message: def.description,
            xp: def.xpBonus,
          });
        }
      }
    }

    if (currentRankObj.level > prevRankLevelRef.current) {
      pushNotification({
        type: 'rank',
        title: `¡Ascenso a ${currentRankObj.title}!`,
        message: currentRankObj.summary,
      });
    }

    prevUnlockedRef.current = progress.unlockedAchievementIds;
    prevRankLevelRef.current = currentRankObj.level;
  }, [progress.unlockedAchievementIds, progress.xp]);

  const applyProgressUpdate = (updater: (prev: PlayerProgress) => PlayerProgress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      let extraXp = 0;
      const newlyUnlockedIds: string[] = [];
      const newTimestamps: Record<string, string> = { ...updated.unlockedAt };
      const todayStr = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      });

      for (const ach of ACHIEVEMENTS) {
        if (updated.unlockedAchievementIds.includes(ach.id)) continue;
        const status = getAchievementProgress(ach, updated);
        if (status.unlocked) {
          newlyUnlockedIds.push(ach.id);
          extraXp += ach.xpBonus;
          newTimestamps[ach.id] = todayStr;
        }
      }

      return {
        ...updated,
        xp: updated.xp + extraXp,
        unlockedAchievementIds: [...updated.unlockedAchievementIds, ...newlyUnlockedIds],
        unlockedAt: newTimestamps,
      };
    });
  };

  const handleSelectWeather = (level: SpaceWeatherLevel) => {
    soundFx.playSwitch();
    setWeatherLevel(level);
    applyProgressUpdate((prev) => {
      if (prev.inspectedWeatherLevels.includes(level)) {
        return prev;
      }
      return {
        ...prev,
        xp: prev.xp + 10,
        inspectedWeatherLevels: [...prev.inspectedWeatherLevels, level],
      };
    });
  };

  const handleCompleteMiniLab = (missionId: string, xpBonus: number) => {
    applyProgressUpdate((prev) => {
      const alreadyDone = prev.completedMiniLabs.includes(missionId);
      return {
        ...prev,
        xp: prev.xp + (alreadyDone ? 10 : xpBonus),
        completedMiniLabs: alreadyDone
          ? prev.completedMiniLabs
          : [...prev.completedMiniLabs, missionId],
      };
    });
  };

  const handleRecordAnswer = (
    questionId: string,
    isCorrect: boolean,
    isFirstAttempt: boolean
  ) => {
    applyProgressUpdate((prev) => {
      if (!isCorrect) {
        return {
          ...prev,
          currentStreak: 0,
        };
      }
      const alreadyAnswered = prev.correctQuestionIds.includes(questionId);
      const nextStreak = isFirstAttempt ? prev.currentStreak + 1 : prev.currentStreak;
      return {
        ...prev,
        xp: prev.xp + (alreadyAnswered ? 10 : 35),
        correctQuestionIds: alreadyAnswered
          ? prev.correctQuestionIds
          : [...prev.correctQuestionIds, questionId],
        currentStreak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  };

  const handleCompleteMission = (mission: Mission) => {
    applyProgressUpdate((prev) => {
      const alreadyCompleted = prev.completedMissionIds.includes(mission.id);
      return {
        ...prev,
        xp: prev.xp + (alreadyCompleted ? 25 : mission.xpReward),
        completedMissionIds: alreadyCompleted
          ? prev.completedMissionIds
          : [...prev.completedMissionIds, mission.id],
      };
    });

    pushNotification({
      type: 'mission',
      title: mission.title,
      message: 'Excelente entrenamiento espacial. Revisa tus nuevas insignias en el diario.',
      xp: mission.xpReward,
    });
  };

  const handleExploreLog = (logId: string) => {
    soundFx.playCorrect();
    applyProgressUpdate((prev) => {
      if (prev.exploredLogIds.includes(logId)) return prev;
      return {
        ...prev,
        xp: prev.xp + 15,
        exploredLogIds: [...prev.exploredLogIds, logId],
      };
    });
  };

  const handleToggleSound = () => {
    const nextMuted = !muted;
    soundFx.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) {
      soundFx.playSwitch();
    }
  };

  const handleResetProgress = () => {
    soundFx.playSwitch();
    setProgress({ ...INITIAL_PROGRESS, hasSeenGuide: true });
    setSelectedMissionId(null);
    setWeatherLevel('green');
    setConfirmReset(false);
  };

  const handleCloseGuide = () => {
    setGuideOpen(false);
    setGuideStepIndex(0);
    setProgress((prev) => (prev.hasSeenGuide ? prev : { ...prev, hasSeenGuide: true }));
  };

  const handleReplayGuide = () => {
    soundFx.playSwitch();
    setActiveTab('mando');
    setSelectedMissionId(null);
    setGuideStepIndex(0);
    setGuideOpen(true);
  };

  const handleChangeCadetProfile = (updates: {
    cadetName?: string;
    suitColor?: SuitColor;
  }) => {
    setProgress((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleCollectOrb = () => {
    applyProgressUpdate((prev) => ({
      ...prev,
      xp: prev.xp + 10,
      orbsCollected: prev.orbsCollected + 1,
    }));
  };

  const handleStationInteract = (stationId: string) => {
    applyProgressUpdate((prev) => {
      if (prev.deckInteractions.includes(stationId)) return prev;
      return {
        ...prev,
        xp: prev.xp + 10,
        deckInteractions: [...prev.deckInteractions, stationId],
      };
    });
  };

  const handleStartNextMission = () => {
    const nextMission =
      MISSIONS.find((m) => !progress.completedMissionIds.includes(m.id)) ?? MISSIONS[0];
    setSelectedMissionId(nextMission.id);
    setActiveTab('misiones');
  };

  const currentRank = getAstronautRank(progress.xp);
  const unlockedCount = progress.unlockedAchievementIds.length;
  const nextLockedAchievement = ACHIEVEMENTS.find(
    (ach) => !progress.unlockedAchievementIds.includes(ach.id)
  );
  const nextAchStatus = nextLockedAchievement
    ? getAchievementProgress(nextLockedAchievement, progress)
    : null;

  return (
    <div className="min-h-screen bg-[#0b1221] text-slate-100 flex flex-col">
      {/* Barra superior de 3 zonas */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0b1221]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('mando');
              setSelectedMissionId(null);
            }}
            className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 text-left"
          >
            Guardianes del Escudo
          </button>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {(
              [
                { id: 'mando', label: 'Centro de Mando', guideId: 'nav-mando' },
                { id: 'misiones', label: 'Misiones', guideId: 'nav-misiones' },
                { id: 'logros', label: 'Diario de Logros', guideId: 'nav-logros' },
                { id: 'bitacora', label: 'Bitácora NASA', guideId: 'nav-bitacora' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-guide-id={tab.guideId}
                  onClick={() => {
                    soundFx.playSwitch();
                    setActiveTab(tab.id);
                    if (tab.id !== 'misiones') {
                      setSelectedMissionId(null);
                    }
                  }}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'border-sky-400 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleStartNextMission}
              className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Entrenar ahora
            </button>
          </div>
        </div>

        {/* Navegación compacta para móvil */}
        <div className="md:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-4 overflow-x-auto">
          {(
            [
              { id: 'mando', label: 'Mando', guideId: 'nav-mando' },
              { id: 'misiones', label: 'Misiones', guideId: 'nav-misiones' },
              { id: 'logros', label: 'Diario', guideId: 'nav-logros' },
              { id: 'bitacora', label: 'Bitácora', guideId: 'nav-bitacora' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-guide-id={tab.guideId}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold py-1 border-b-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-8 space-y-8">
        {/* Franja de herramientas del Cadete (Guía, Audio y Reinicio seguro) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-200">{currentRank.title}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-300">{progress.xp} XP</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-emerald-300">
              {unlockedCount} / {ACHIEVEMENTS.length} insignias
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReplayGuide}
              className="inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Guía del Cadete</span>
            </button>

            <span aria-hidden="true" className="text-slate-700">
              |
            </span>

            <button
              type="button"
              onClick={handleToggleSound}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {muted ? (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{muted ? 'Sonido silenciado' : 'Sonido activo'}</span>
            </button>

            <span aria-hidden="true" className="text-slate-700">
              |
            </span>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reiniciar progreso</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-amber-300">¿Borrar tus insignias?</span>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-2.5 py-1 rounded bg-rose-500 text-white font-semibold hover:bg-rose-400"
                >
                  Sí, reiniciar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vista 1: Centro de Mando */}
        {activeTab === 'mando' && (
          <div className="space-y-8">
            {/* Escenario RPG interactivo + Semáforo Cósmico */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <RPGCabinStage
                  progress={progress}
                  weatherLevel={weatherLevel}
                  onChangeCadetProfile={handleChangeCadetProfile}
                  onCollectOrb={handleCollectOrb}
                  onStationInteract={handleStationInteract}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onStartNextMission={handleStartNextMission}
                />
              </div>

              {/* Columna derecha: Semáforo Cósmico */}
              <div className="lg:col-span-5 flex flex-col">
                <SemaforoCosmico
                  activeLevel={weatherLevel}
                  inspectedLevels={progress.inspectedWeatherLevels}
                  onSelectLevel={handleSelectWeather}
                />
              </div>
            </div>

            {/* Franja de 4 KPIs de Progreso */}
            <div data-guide-id="kpi-strip" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-5">
                <p className="text-xs text-slate-400">Rango de astronauta</p>
                <p className="mt-1.5 text-lg font-bold text-white">{currentRank.title}</p>
                <p className="mt-1 font-mono tabular-nums text-xs text-sky-300">
                  Nivel {currentRank.level} de 5
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-5">
                <p className="text-xs text-slate-400">Experiencia acumulada</p>
                <p className="mt-1.5 font-mono tabular-nums text-2xl font-bold text-amber-300">
                  {progress.xp} XP
                </p>
                <p className="mt-1 text-xs text-slate-400">Entrenamiento NASA</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-5">
                <p className="text-xs text-slate-400">Misiones superadas</p>
                <p className="mt-1.5 font-mono tabular-nums text-2xl font-bold text-emerald-300">
                  {progress.completedMissionIds.length} / {MISSIONS.length}
                </p>
                <p className="mt-1 text-xs text-slate-400">Ruta Luna a Marte</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-5">
                <p className="text-xs text-slate-400">Insignias ganadas</p>
                <p className="mt-1.5 font-mono tabular-nums text-2xl font-bold text-white">
                  {unlockedCount} / {ACHIEVEMENTS.length}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-300 font-mono tabular-nums">
                  <Flame className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                  Racha: {progress.bestStreak} aciertos
                </p>
              </div>
            </div>

            {/* Próximo objetivo del Diario de Logros */}
            {nextLockedAchievement && nextAchStatus && (
              <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-300">
                    Próxima insignia recomendada · +{nextLockedAchievement.xpBonus} XP
                  </p>
                  <h3 className="text-lg font-bold text-white">
                    {nextLockedAchievement.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    Requisito: {nextLockedAchievement.requirementText} (
                    <span className="font-mono tabular-nums">
                      {nextAchStatus.current}/{nextAchStatus.target}
                    </span>
                    )
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('logros')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/50 bg-amber-400/10 text-amber-200 text-xs font-bold hover:bg-amber-400/20 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Abrir Diario de Logros</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vista 2: Misiones */}
        {activeTab === 'misiones' && (
          <MissionTrainer
            progress={progress}
            selectedMissionId={selectedMissionId}
            onSelectMission={setSelectedMissionId}
            onCompleteMiniLab={handleCompleteMiniLab}
            onRecordAnswer={handleRecordAnswer}
            onCompleteMission={handleCompleteMission}
            onOpenJournal={() => {
              setSelectedMissionId(null);
              setActiveTab('logros');
            }}
          />
        )}

        {/* Vista 3: Diario de Logros */}
        {activeTab === 'logros' && (
          <DiarioDeLogros
            progress={progress}
            onNavigateTab={(tab) => {
              if (tab === 'mando') setActiveTab('mando');
              else if (tab === 'bitacora') setActiveTab('bitacora');
              else setActiveTab('misiones');
            }}
          />
        )}

        {/* Vista 4: Bitácora Científica NASA */}
        {activeTab === 'bitacora' && (
          <BitacoraNASA progress={progress} onExploreLog={handleExploreLog} />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        Guardianes del Escudo Espacial: De la Luna a Marte · Inspirado en datos abiertos de NASA OSDR, CCMC DONKI y la Agencia Espacial Canadiense (CSA).
      </footer>

      <ToastCelebration
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((item) => item.id !== id))
        }
        onOpenJournal={() => {
          setSelectedMissionId(null);
          setActiveTab('logros');
        }}
      />

      <CadetGuideOverlay
        isOpen={guideOpen}
        steps={GUIDE_STEPS}
        currentStepIndex={guideStepIndex}
        onNext={() =>
          setGuideStepIndex((prev) => Math.min(GUIDE_STEPS.length - 1, prev + 1))
        }
        onPrev={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
        onClose={handleCloseGuide}
      />
    </div>
  );
}
