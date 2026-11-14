import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BookOpen,
  Compass,
  Heart,
  Radio,
  Rocket,
  Shield,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { GAME_IMAGES, MISSIONS, getAstronautRank } from '../data/gameData';
import { PlayerProgress, SpaceWeatherLevel, SuitColor } from '../types/game';
import { soundFx } from '../utils/soundFx';

interface RPGCabinStageProps {
  progress: PlayerProgress;
  weatherLevel: SpaceWeatherLevel;
  onChangeCadetProfile: (updates: { cadetName?: string; suitColor?: SuitColor }) => void;
  onCollectOrb: () => void;
  onStationInteract: (stationId: string) => void;
  onNavigateTab: (tab: 'mando' | 'misiones' | 'logros' | 'bitacora') => void;
  onStartNextMission: () => void;
}

interface DeckStation {
  id: string;
  label: string;
  role: string;
  x: number; // porcentaje 0..100
  y: number; // porcentaje 0..100
  actionLabel: string;
  dialogue: string;
  icon: typeof Shield;
  accentClass: string;
}

const DECK_STATIONS: DeckStation[] = [
  {
    id: 'station-semaforo',
    label: 'Radar Solar',
    role: 'Clima Espacial DONKI',
    x: 18,
    y: 26,
    actionLabel: 'Revisar Semáforo Cósmico',
    dialogue:
      'Aquí vigilamos el viento solar y las tormentas geomagnéticas. Si cambia a Rojo, ¡activa el escudo!',
    icon: Radio,
    accentClass: 'border-amber-400/60 bg-amber-500/15 text-amber-300',
  },
  {
    id: 'station-misiones',
    label: 'Puente de Vuelo',
    role: 'Ruta Luna a Marte',
    x: 50,
    y: 22,
    actionLabel: 'Ir a Misiones',
    dialogue:
      '¡Despegue listo, Cadete! Desde este puente trazamos la ruta de la Luna a Marte paso a paso.',
    icon: Rocket,
    accentClass: 'border-sky-400/60 bg-sky-500/15 text-sky-300',
  },
  {
    id: 'station-bitacora',
    label: 'Archivo NASA',
    role: 'Datos Abiertos',
    x: 82,
    y: 26,
    actionLabel: 'Abrir Bitácora NASA',
    dialogue:
      'Archivos reales de OSDR RadLab, Bio-Repository y la Agencia Espacial Canadiense esperan tu lectura.',
    icon: BookOpen,
    accentClass: 'border-indigo-400/60 bg-indigo-500/15 text-indigo-300',
  },
  {
    id: 'station-veggie',
    label: 'Módulo Veggie',
    role: 'Cultivo Hidropónico',
    x: 20,
    y: 76,
    actionLabel: 'Regar lechugas (+10 XP)',
    dialogue:
      'Tus lechugas y rábanos crecen bajo luces LED violetas. ¡Cuidarlos recarga tu vitalidad espacial!',
    icon: Sprout,
    accentClass: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300',
  },
  {
    id: 'station-logros',
    label: 'Vitrina de Logros',
    role: 'Insignias y Rangos',
    x: 80,
    y: 76,
    actionLabel: 'Ver Diario de Logros',
    dialogue:
      'Cada misión, pregunta acertada y exploración en cabina suma insignias brillantes a tu diario.',
    icon: Award,
    accentClass: 'border-amber-300/60 bg-amber-400/15 text-amber-200',
  },
];

const SUIT_STYLES: Record<
  SuitColor,
  { name: string; primary: string; trim: string; visor: string; swatch: string }
> = {
  sky: {
    name: 'Azul Orbital',
    primary: '#38bdf8',
    trim: '#0284c7',
    visor: '#bae6fd',
    swatch: 'bg-sky-400',
  },
  amber: {
    name: 'Naranja Artemisa',
    primary: '#fb923c',
    trim: '#ea580c',
    visor: '#fed7aa',
    swatch: 'bg-orange-400',
  },
  emerald: {
    name: 'Verde BioLab',
    primary: '#34d399',
    trim: '#059669',
    visor: '#a7f3d0',
    swatch: 'bg-emerald-400',
  },
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function RPGCabinStage({
  progress,
  weatherLevel,
  onChangeCadetProfile,
  onCollectOrb,
  onStationInteract,
  onNavigateTab,
  onStartNextMission,
}: RPGCabinStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 54 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [botPos, setBotPos] = useState({ x: 42, y: 58 });
  const [orbPos, setOrbPos] = useState<{ x: number; y: number; label: string }>({
    x: 36,
    y: 44,
    label: 'Cristal de Datos',
  });
  const [rpgMessage, setRpgMessage] = useState<string>(
    'Usa las flechas, WASD o haz clic en el piso de la nave para caminar hacia cualquier estación.'
  );
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(progress.cadetName);
  const [botImgError, setBotImgError] = useState(false);

  const currentRank = getAstronautRank(progress.xp);
  const suit = SUIT_STYLES[progress.suitColor] ?? SUIT_STYLES.sky;

  // Atributos RPG calculados dinámicamente con el progreso del jugador
  const shieldStat = Math.min(
    100,
    30 + progress.inspectedWeatherLevels.length * 12 + (progress.completedMissionIds.includes('mission-shield') ? 34 : 0)
  );
  const scienceStat = Math.min(
    100,
    20 + progress.correctQuestionIds.length * 6 + progress.exploredLogIds.length * 5
  );
  const vitalityStat = Math.min(
    100,
    40 +
      (progress.completedMissionIds.includes('mission-veggie') ? 20 : 0) +
      (progress.completedMissionIds.includes('mission-kitchen') ? 20 : 0) +
      (progress.completedMissionIds.includes('mission-body') ? 20 : 0)
  );

  // Detectar estación cercana
  const nearbyStation = useMemo(() => {
    let closest: DeckStation | null = null;
    let bestDist = 17;
    for (const st of DECK_STATIONS) {
      const dist = Math.hypot(playerPos.x - st.x, playerPos.y - st.y);
      if (dist <= bestDist) {
        bestDist = dist;
        closest = st;
      }
    }
    return closest;
  }, [playerPos]);

  // Astro-Bot sigue suavemente al personaje principal
  useEffect(() => {
    const offsetX = facing === 'right' ? -7 : 7;
    const targetX = clamp(playerPos.x + offsetX, 8, 92);
    const targetY = clamp(playerPos.y + 4, 15, 86);
    const timer = window.setTimeout(() => {
      setBotPos({ x: targetX, y: targetY });
      setIsMoving(false);
    }, 140);
    return () => window.clearTimeout(timer);
  }, [playerPos, facing]);

  // Recoger orbes flotantes al pasar por encima
  useEffect(() => {
    const dist = Math.hypot(playerPos.x - orbPos.x, playerPos.y - orbPos.y);
    if (dist <= 8.5) {
      soundFx.playCorrect();
      onCollectOrb();
      setRpgMessage(
        `¡Genial, ${progress.cadetName}! Recogiste un ${orbPos.label} (+10 XP para tu traje espacial).`
      );
      const nextSpots = [
        { x: 32, y: 46, label: 'Cristal Solar' },
        { x: 66, y: 48, label: 'Cápsula Veggie' },
        { x: 50, y: 66, label: 'Chip NASA OSDR' },
        { x: 35, y: 62, label: 'Gota de Agua Pura' },
        { x: 68, y: 36, label: 'Dato Lunar' },
      ];
      const candidate =
        nextSpots.find((s) => Math.hypot(s.x - playerPos.x, s.y - playerPos.y) > 15) ??
        nextSpots[0];
      setOrbPos(candidate);
    }
  }, [playerPos, orbPos, onCollectOrb, progress.cadetName]);

  const movePlayerBy = useCallback((dx: number, dy: number) => {
    setIsMoving(true);
    if (dx < 0) setFacing('left');
    if (dx > 0) setFacing('right');
    setPlayerPos((prev) => ({
      x: clamp(prev.x + dx, 8, 92),
      y: clamp(prev.y + dy, 16, 86),
    }));
  }, []);

  const triggerStationAction = useCallback(
    (station: DeckStation) => {
      soundFx.playSwitch();
      onStationInteract(station.id);
      if (station.id === 'station-misiones') {
        onStartNextMission();
      } else if (station.id === 'station-logros') {
        onNavigateTab('logros');
      } else if (station.id === 'station-bitacora') {
        onNavigateTab('bitacora');
      } else if (station.id === 'station-semaforo') {
        const el = document.querySelector('[data-guide-id="semaforo"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setRpgMessage(
          '¡Escaneando el Semáforo Cósmico! Toca los círculos Verde, Amarillo y Rojo para probar la telemetría.'
        );
      } else if (station.id === 'station-veggie') {
        soundFx.playCorrect();
        onCollectOrb();
        setRpgMessage(
          '¡Regaste el Módulo Veggie! Las lechugas espaciales brillan felices (+10 XP).'
        );
      }
    },
    [onCollectOrb, onNavigateTab, onStartNextMission, onStationInteract]
  );

  // Controles de teclado WASD / Flechas / Tecla E para interactuar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      const step = 6;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        movePlayerBy(0, -step);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        movePlayerBy(0, step);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePlayerBy(-step, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePlayerBy(step, 0);
      } else if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && nearbyStation) {
        if (document.activeElement === document.body) {
          e.preventDefault();
          triggerStationAction(nearbyStation);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayerBy, nearbyStation, triggerStationAction]);

  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    setFacing(clickX < playerPos.x ? 'left' : 'right');
    setIsMoving(true);
    setPlayerPos({
      x: clamp(clickX, 8, 92),
      y: clamp(clickY, 16, 86),
    });
  };

  const weatherBannerTone =
    weatherLevel === 'red'
      ? 'border-rose-500/50 bg-rose-950/35 text-rose-200'
      : weatherLevel === 'yellow'
        ? 'border-amber-400/50 bg-amber-950/30 text-amber-200'
        : 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200';

  return (
    <div
      data-guide-id="rpg-stage"
      className="rounded-2xl border border-slate-800 bg-[#131d33] p-5 sm:p-6 space-y-5"
    >
      {/* Encabezado RPG del Personaje Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-sky-300">Modo RPG · Puente de la Nave</span>
            <span aria-hidden="true">·</span>
            <span>{currentRank.title}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-300">
              {progress.xp} XP
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!editingName ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Cadete {progress.cadetName}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(progress.cadetName);
                    setEditingName(true);
                  }}
                  className="text-xs font-medium text-sky-300 hover:text-sky-200 underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Cambiar nombre
                </button>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleaned = draftName.trim() || 'Explorador';
                  onChangeCadetProfile({ cadetName: cleaned });
                  setEditingName(false);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  maxLength={18}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  aria-label="Nombre del Cadete"
                  className="rounded-lg border border-sky-400 bg-[#0b1221] px-3 py-1.5 text-sm font-semibold text-white w-40"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400"
                >
                  Guardar
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Selector de color de traje espacial */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Traje:</span>
          {(['sky', 'amber', 'emerald'] as SuitColor[]).map((colorKey) => {
            const active = progress.suitColor === colorKey;
            return (
              <button
                key={colorKey}
                type="button"
                onClick={() => {
                  soundFx.playSwitch();
                  onChangeCadetProfile({ suitColor: colorKey });
                }}
                aria-label={`Elegir traje ${SUIT_STYLES[colorKey].name}`}
                aria-pressed={active}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  SUIT_STYLES[colorKey].swatch
                } ${active ? 'border-white scale-110' : 'border-slate-700 opacity-70 hover:opacity-100'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Barras de atributos RPG */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#0b1221] px-3.5 py-2.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Shield className="w-4 h-4 text-sky-400" aria-hidden="true" />
            Escudo
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-[130px]">
            <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${shieldStat}%` }} />
            </div>
            <span className="font-mono tabular-nums text-xs text-sky-300">{shieldStat}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0b1221] px-3.5 py-2.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Compass className="w-4 h-4 text-amber-300" aria-hidden="true" />
            Ciencia
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-[130px]">
            <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-300 transition-all duration-300" style={{ width: `${scienceStat}%` }} />
            </div>
            <span className="font-mono tabular-nums text-xs text-amber-300">{scienceStat}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0b1221] px-3.5 py-2.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Heart className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Vitalidad
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-[130px]">
            <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${vitalityStat}%` }} />
            </div>
            <span className="font-mono tabular-nums text-xs text-emerald-300">{vitalityStat}</span>
          </div>
        </div>
      </div>

      {/* Escenario interactivo RPG 2D */}
      <div
        ref={stageRef}
        onClick={handleFloorClick}
        role="application"
        aria-label="Mapa interactivo de la cabina espacial RPG. Haz clic para mover al cadete o usa las flechas del teclado."
        className="relative h-[340px] sm:h-[380px] w-full rounded-2xl border border-slate-700/90 bg-[#09101f] overflow-hidden select-none cursor-crosshair"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.14), transparent 55%), linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      >
        {/* Ventanal espacial superior mostrando ruta Luna -> Marte */}
        <div
          className={`absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg border text-xs font-medium pointer-events-none flex items-center gap-3 whitespace-nowrap ${weatherBannerTone}`}
        >
          <span>Luna</span>
          <span className="font-mono tabular-nums">
            Progreso de ruta: {progress.completedMissionIds.length}/{MISSIONS.length}
          </span>
          <span>Marte</span>
        </div>

        {/* Estaciones interactivas sobre el puente */}
        {DECK_STATIONS.map((station) => {
          const Icon = station.icon;
          const isNear = nearbyStation?.id === station.id;
          return (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                setFacing(station.x < playerPos.x ? 'left' : 'right');
                setPlayerPos({
                  x: clamp(station.x, 10, 90),
                  y: clamp(station.y + (station.y < 50 ? 11 : -11), 16, 86),
                });
                triggerStationAction(station);
              }}
              style={{ left: `${station.x}%`, top: `${station.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-left transition-transform duration-150 ${
                isNear
                  ? `${station.accentClass} scale-105 shadow-lg`
                  : 'border-slate-700/90 bg-[#131d33]/95 text-slate-200 hover:border-sky-400/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none whitespace-nowrap">
                    {station.label}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight whitespace-nowrap mt-0.5">
                    {station.role}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        {/* Orbe coleccionable en el puente */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFacing(orbPos.x < playerPos.x ? 'left' : 'right');
            setPlayerPos({ x: orbPos.x, y: orbPos.y });
          }}
          style={{ left: `${orbPos.x}%`, top: `${orbPos.y}%` }}
          aria-label={`Recoger ${orbPos.label}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/80 bg-amber-400/20 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.45)] group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-semibold text-amber-200 bg-slate-950/80 px-1.5 py-0.5 rounded whitespace-nowrap">
            +10 XP
          </span>
        </button>

        {/* Compañero Astro-Bot siguiendo al jugador */}
        <div
          aria-hidden="true"
          style={{ left: `${botPos.x}%`, top: `${botPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
        >
          <div className="h-9 w-9 rounded-full border border-sky-300/80 bg-[#1a2947] flex items-center justify-center shadow-md">
            <svg viewBox="0 0 36 36" className="w-7 h-7">
              <rect x="8" y="10" width="20" height="16" rx="6" fill="#e2e8f0" />
              <rect x="11" y="13" width="14" height="8" rx="3" fill="#0f172a" />
              <circle cx="15" cy="17" r="1.8" fill="#38bdf8" />
              <circle cx="21" cy="17" r="1.8" fill="#38bdf8" />
              <line x1="18" y1="10" x2="18" y2="5" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="18" cy="5" r="2" fill="#fbbf24" />
            </svg>
          </div>
        </div>

        {/* Personaje Principal manipulable: Cadete Astronauta */}
        <div
          style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ease-out flex flex-col items-center"
        >
          <div
            className={`transition-transform duration-150 ${
              isMoving ? '-translate-y-1' : 'translate-y-0'
            }`}
            style={{
              transform: `${facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'} ${
                isMoving ? 'translateY(-3px)' : ''
              }`,
            }}
          >
            <svg viewBox="0 0 48 56" className="w-12 h-14 drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)]">
              {/* Mochila propulsora */}
              <rect x="7" y="22" width="8" height="18" rx="3" fill={suit.trim} />
              {/* Cuerpo del traje */}
              <rect x="13" y="22" width="22" height="20" rx="6" fill="#f8fafc" stroke={suit.primary} strokeWidth="2" />
              {/* Emblema del escudo en el pecho */}
              <circle cx="24" cy="31" r="4" fill={suit.primary} />
              {/* Piernas */}
              <rect x="15" y="40" width="7" height="11" rx="3" fill="#e2e8f0" />
              <rect x="26" y="40" width="7" height="11" rx="3" fill="#e2e8f0" />
              {/* Botas */}
              <rect x="14" y="48" width="9" height="5" rx="2" fill={suit.trim} />
              <rect x="25" y="48" width="9" height="5" rx="2" fill={suit.trim} />
              {/* Casco y visor espacial */}
              <circle cx="24" cy="14" r="12" fill="#f8fafc" stroke={suit.primary} strokeWidth="2" />
              <rect x="16" y="8" width="17" height="11" rx="5" fill="#0f172a" />
              <path d="M19 11 Q23 9 28 11" stroke={suit.visor} strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <span className="mt-0.5 rounded bg-slate-950/90 border border-slate-700 px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
            {progress.cadetName}
          </span>
        </div>

        {/* Controles táctiles / D-Pad en pantalla */}
        <div
          className="absolute bottom-3 left-3 grid grid-cols-3 gap-1 w-28 bg-[#0b1221]/85 p-1.5 rounded-xl border border-slate-700/80"
          onClick={(e) => e.stopPropagation()}
        >
          <div />
          <button
            type="button"
            onClick={() => movePlayerBy(0, -8)}
            aria-label="Mover cadete arriba"
            className="h-8 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-white flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => movePlayerBy(-8, 0)}
            aria-label="Mover cadete a la izquierda"
            className="h-8 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-white flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => movePlayerBy(0, 8)}
            aria-label="Mover cadete abajo"
            className="h-8 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-white flex items-center justify-center transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => movePlayerBy(8, 0)}
            aria-label="Mover cadete a la derecha"
            className="h-8 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-white flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Coordenadas en vivo */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-[#0b1221]/85 border border-slate-700/80 px-2.5 py-1 font-mono tabular-nums text-[11px] text-slate-300 pointer-events-none">
          X:{Math.round(playerPos.x)} · Y:{Math.round(playerPos.y)} · Orbes:{progress.orbsCollected}
        </div>
      </div>

      {/* Cuadro de diálogo RPG inferior */}
      <div className="rounded-xl border border-slate-700/90 bg-[#0b1221] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {!botImgError ? (
            <img
              src={GAME_IMAGES.astroBot}
              alt="Retrato de Astro-Bot"
              referrerPolicy="no-referrer"
              onError={() => setBotImgError(true)}
              className="h-12 w-12 rounded-xl object-cover border border-sky-400/50 shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-sky-300" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold text-sky-300">
              {nearbyStation ? `Estación cercana: ${nearbyStation.label}` : 'Astro-Bot · Bitácora RPG'}
            </p>
            <p className="mt-0.5 text-sm text-slate-200 leading-snug">
              {nearbyStation ? nearbyStation.dialogue : rpgMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nearbyStation ? (
            <button
              type="button"
              onClick={() => triggerStationAction(nearbyStation)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{nearbyStation.actionLabel}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartNextMission}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Ir a misiones</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
