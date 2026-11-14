import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Dumbbell,
  HelpCircle,
  RotateCcw,
  Shield,
  Sprout,
  Utensils,
} from 'lucide-react';
import { MISSIONS } from '../data/gameData';
import { Mission, PlayerProgress } from '../types/game';
import { soundFx } from '../utils/soundFx';

interface MissionTrainerProps {
  progress: PlayerProgress;
  selectedMissionId: string | null;
  onSelectMission: (missionId: string | null) => void;
  onCompleteMiniLab: (missionId: string, xpBonus: number) => void;
  onRecordAnswer: (questionId: string, isCorrect: boolean, isFirstAttempt: boolean) => void;
  onCompleteMission: (mission: Mission) => void;
  onOpenJournal: () => void;
}

type Stage = 'minilab' | 'quiz' | 'summary';

const KITCHEN_ITEMS = [
  { id: 'tortilla', label: 'Tortillas suaves de harina', safe: true, note: 'No sueltan migajas al doblarse.' },
  { id: 'pouch', label: 'Bolsa sellada con popote', safe: true, note: 'Mantiene el líquido seguro sin gotas sueltas.' },
  { id: 'salt', label: 'Sal y pimienta líquidas', safe: true, note: 'Las gotas se pegan a la comida y no flotan.' },
  { id: 'toast', label: 'Pan tostado crujiente', safe: false, note: '¡Cuidado! Suelta migajas que tapan filtros de aire.' },
  { id: 'cookie', label: 'Galletas con azúcar suelta', safe: false, note: '¡Cuidado! El polvo dulce flota hacia los ojos.' },
];

export function MissionTrainer({
  progress,
  selectedMissionId,
  onSelectMission,
  onCompleteMiniLab,
  onRecordAnswer,
  onCompleteMission,
  onOpenJournal,
}: MissionTrainerProps) {
  const activeMission = MISSIONS.find((m) => m.id === selectedMissionId) ?? null;

  const [stage, setStage] = useState<Stage>('minilab');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [questionSolved, setQuestionSolved] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // Estados de los mini-laboratorios interactivos
  const [shieldPower, setShieldPower] = useState(45);
  const [ledRed, setLedRed] = useState(false);
  const [ledBlue, setLedBlue] = useState(false);
  const [veggieHumidity, setVeggieHumidity] = useState(40);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [kitchenFeedback, setKitchenFeedback] = useState<string | null>(null);
  const [exerciseMinutes, setExerciseMinutes] = useState({
    ared: 30,
    treadmill: 30,
    bike: 15,
  });

  const resetLocalMissionState = () => {
    setStage('minilab');
    setQuestionIndex(0);
    setSelectedOption(null);
    setAttemptCount(0);
    setQuestionSolved(false);
    setSessionXp(0);
    setShieldPower(45);
    setLedRed(false);
    setLedBlue(false);
    setVeggieHumidity(40);
    setSelectedFoodIds([]);
    setKitchenFeedback(null);
    setExerciseMinutes({ ared: 30, treadmill: 30, bike: 15 });
  };

  const handleStartMission = (missionId: string) => {
    soundFx.playSwitch();
    resetLocalMissionState();
    onSelectMission(missionId);
  };

  // Vista 1: Mapa de Misiones de la Luna a Marte
  if (!activeMission) {
    return (
      <section aria-labelledby="misiones-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-sky-300">
              Ruta de entrenamiento · De la Luna a Marte
            </p>
            <h2 id="misiones-heading" className="mt-1 text-2xl sm:text-3xl font-bold text-white">
              Misiones de Entrenamiento Espacial
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Practica en los laboratorios de cabina y responde desafíos basados en datos reales de la NASA y la Agencia Espacial Canadiense para ganar XP e insignias.
            </p>
          </div>
          <p className="font-mono tabular-nums text-sm text-slate-300 whitespace-nowrap shrink-0">
            Completadas: {progress.completedMissionIds.length} / {MISSIONS.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISSIONS.map((mission) => {
            const isCompleted = progress.completedMissionIds.includes(mission.id);
            const hasImgError = imgErrorMap[mission.id];

            return (
              <article
                key={mission.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-[#132036]'
                    : 'border-slate-800 bg-[#131d33]'
                }`}
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    {!hasImgError ? (
                      <img
                        src={mission.imageUrl}
                        alt={mission.imageAlt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImgErrorMap((prev) => ({ ...prev, [mission.id]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400">
                        <Shield className="w-10 h-10" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131d33] via-transparent to-transparent" />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono tabular-nums text-sky-300 font-semibold">
                        Misión {mission.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{mission.planetStage}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-amber-300">
                        +{mission.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{mission.subtitle}</p>
                    <p className="text-xs text-slate-400">Fuente: {mission.nasaSource}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      isCompleted ? 'text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Misión superada
                      </>
                    ) : (
                      'Lista para entrenar'
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStartMission(mission.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{isCompleted ? 'Practicar de nuevo' : 'Iniciar misión'}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  // Verificar si el mini-lab actual cumplió su objetivo científico
  const totalExerciseMins =
    exerciseMinutes.ared + exerciseMinutes.treadmill + exerciseMinutes.bike;

  const isMiniLabReady = (() => {
    switch (activeMission.miniLabType) {
      case 'shield':
        return shieldPower >= 85;
      case 'veggie':
        return ledRed && ledBlue && veggieHumidity >= 65 && veggieHumidity <= 75;
      case 'kitchen':
        return (
          selectedFoodIds.length === 3 &&
          selectedFoodIds.every((id) => KITCHEN_ITEMS.find((item) => item.id === id)?.safe)
        );
      case 'fitness':
        return totalExerciseMins >= 150;
    }
  })();

  const handleFinishMiniLab = () => {
    soundFx.playCorrect();
    onCompleteMiniLab(activeMission.id, 30);
    setSessionXp((prev) => prev + 30);
    setStage('quiz');
  };

  const currentQuestion = activeMission.questions[questionIndex];

  const handleAnswerSelect = (optionIdx: number) => {
    if (questionSolved) return;
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const isFirstAttempt = attemptCount === 0;
    setAttemptCount((prev) => prev + 1);

    if (isCorrect) {
      soundFx.playCorrect();
      setQuestionSolved(true);
      setSessionXp((prev) => prev + 35);
      onRecordAnswer(currentQuestion.id, true, isFirstAttempt);
    } else {
      soundFx.playTryAgain();
      onRecordAnswer(currentQuestion.id, false, isFirstAttempt);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 < activeMission.questions.length) {
      soundFx.playSwitch();
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAttemptCount(0);
      setQuestionSolved(false);
    } else {
      soundFx.playUnlock();
      onCompleteMission(activeMission);
      setSessionXp((prev) => prev + activeMission.xpReward);
      setStage('summary');
    }
  };

  const handleToggleKitchenFood = (item: (typeof KITCHEN_ITEMS)[number]) => {
    if (!item.safe) {
      soundFx.playTryAgain();
      setKitchenFeedback(item.note);
      return;
    }
    soundFx.playCorrect();
    setKitchenFeedback(`¡Bien elegido! ${item.note}`);
    setSelectedFoodIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  return (
    <section aria-labelledby="active-mission-title" className="space-y-6">
      {/* Barra superior de misión activa */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#131d33] px-5 py-3.5">
        <button
          type="button"
          onClick={() => onSelectMission(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Volver a Misiones</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>
            Misión {activeMission.number}: {activeMission.planetStage}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-amber-300 font-semibold">
            +{sessionXp} XP en esta sesión
          </span>
        </div>
      </div>

      {/* Etapa 1: Laboratorio Interactivo de Cabina */}
      {stage === 'minilab' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-300">
              Paso 1 de 2 · Práctica interactiva de cabina
            </p>
            <h2 id="active-mission-title" className="text-2xl font-bold text-white">
              {activeMission.miniLabTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              {activeMission.miniLabInstruction}
            </p>
          </div>

          {/* Mini-lab 1: Escudo Magnético */}
          {activeMission.miniLabType === 'shield' && (
            <div className="rounded-xl border border-slate-700/80 bg-[#0d1629] p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Shield className="w-5 h-5 text-sky-400" aria-hidden="true" />
                  Potencia del Escudo Deflector
                </span>
                <span
                  className={`font-mono tabular-nums text-xl font-bold ${
                    shieldPower >= 85 ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {shieldPower}%
                </span>
              </div>

              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={shieldPower}
                onChange={(e) => setShieldPower(Number(e.target.value))}
                aria-label="Potencia del escudo magnético en porcentaje"
                className="w-full accent-sky-400 cursor-pointer h-3"
              />

              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                <span>20% (Mínimo)</span>
                <span>Meta segura: 85% o más</span>
                <span>100% (Máximo)</span>
              </div>

              <div
                className={`rounded-lg border p-4 text-sm ${
                  isMiniLabReady
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                }`}
              >
                {isMiniLabReady
                  ? '¡Escudo calibrado con éxito! Las partículas solares de 850 km/s rebotan fuera del casco.'
                  : 'La ráfaga solar sigue golpeando la cápsula. Sube el escudo al menos al 85%.'}
              </div>
            </div>
          )}

          {/* Mini-lab 2: Invernadero Veggie */}
          {activeMission.miniLabType === 'veggie' && (
            <div className="rounded-xl border border-slate-700/80 bg-[#0d1629] p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSwitch();
                    setLedRed((v) => !v);
                  }}
                  aria-pressed={ledRed}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    ledRed
                      ? 'border-rose-400 bg-rose-500/15 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="text-sm font-bold">Luz LED Roja (630 nm)</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {ledRed ? 'Encendida · Impulsa crecimiento de hojas' : 'Apagada · Toca para encender'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSwitch();
                    setLedBlue((v) => !v);
                  }}
                  aria-pressed={ledBlue}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    ledBlue
                      ? 'border-sky-400 bg-sky-500/15 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="text-sm font-bold">Luz LED Azul (450 nm)</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {ledBlue ? 'Encendida · Fortalece tallos y raíces' : 'Apagada · Toca para encender'}
                  </p>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    <Sprout className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    Humedad de almohadilla hidropónica
                  </span>
                  <span className="font-mono tabular-nums text-lg font-bold text-sky-300">
                    {veggieHumidity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={95}
                  step={5}
                  value={veggieHumidity}
                  onChange={(e) => setVeggieHumidity(Number(e.target.value))}
                  aria-label="Porcentaje de humedad de almohadilla Veggie"
                  className="w-full accent-emerald-400 cursor-pointer h-3"
                />
                <div className="flex justify-between text-xs font-mono tabular-nums text-slate-400">
                  <span>20% (Seco)</span>
                  <span>Zona ideal: 65% - 75%</span>
                  <span>95% (Encharcado)</span>
                </div>
              </div>

              <div
                className={`rounded-lg border p-4 text-sm ${
                  isMiniLabReady
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                }`}
              >
                {isMiniLabReady
                  ? '¡Invernadero Veggie óptimo! Las lechugas realizan fotosíntesis con luz violeta y humedad perfecta.'
                  : 'Enciende ambas luces (Roja + Azul) y coloca la humedad entre 65% y 75%.'}
              </div>
            </div>
          )}

          {/* Mini-lab 3: Cocina Sin Migajas */}
          {activeMission.miniLabType === 'kitchen' && (
            <div className="rounded-xl border border-slate-700/80 bg-[#0d1629] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Utensils className="w-5 h-5 text-amber-300" aria-hidden="true" />
                  Bandeja Espacial Segura
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-sky-300">
                  {selectedFoodIds.length} / 3 alimentos seguros
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {KITCHEN_ITEMS.map((item) => {
                  const isPicked = selectedFoodIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleKitchenFood(item)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        isPicked
                          ? 'border-emerald-400 bg-emerald-500/15 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {isPicked && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {kitchenFeedback && (
                <div
                  className={`rounded-lg border p-3.5 text-sm ${
                    kitchenFeedback.startsWith('¡Cuidado')
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  {kitchenFeedback}
                </div>
              )}
            </div>
          )}

          {/* Mini-lab 4: Entrenamiento Antigravedad */}
          {activeMission.miniLabType === 'fitness' && (
            <div className="rounded-xl border border-slate-700/80 bg-[#0d1629] p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Dumbbell className="w-5 h-5 text-sky-400" aria-hidden="true" />
                  Tiempo total de ejercicio diario
                </span>
                <span
                  className={`font-mono tabular-nums text-xl font-bold ${
                    totalExerciseMins >= 150 ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {totalExerciseMins} / 150 min
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'ared' as const, label: 'Máquina de Fuerza ARED', max: 90 },
                  { key: 'treadmill' as const, label: 'Cinta con Arneses', max: 90 },
                  { key: 'bike' as const, label: 'Bicicleta Espacial', max: 60 },
                ].map((station) => (
                  <div
                    key={station.key}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3"
                  >
                    <p className="text-sm font-semibold text-white">{station.label}</p>
                    <p className="font-mono tabular-nums text-2xl font-bold text-sky-300">
                      {exerciseMinutes[station.key]} min
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExerciseMinutes((prev) => ({
                            ...prev,
                            [station.key]: Math.max(0, prev[station.key] - 15),
                          }))
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
                      >
                        -15m
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playSwitch();
                          setExerciseMinutes((prev) => ({
                            ...prev,
                            [station.key]: Math.min(station.max, prev[station.key] + 15),
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 text-xs font-bold text-slate-950 hover:bg-sky-400"
                      >
                        +15m
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`rounded-lg border p-4 text-sm ${
                  isMiniLabReady
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                }`}
              >
                {isMiniLabReady
                  ? '¡Meta física alcanzada! Tus huesos y músculos están listos para la gravedad de Marte.'
                  : 'Suma al menos 150 minutos (2.5 horas) de ejercicio diario usando los botones +15m.'}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!isMiniLabReady}
              onClick={handleFinishMiniLab}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-bold hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <span>Continuar al Desafío NASA (+30 XP)</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Preguntas Científicas de la NASA */}
      {stage === 'quiz' && currentQuestion && (
        <div className="rounded-2xl border border-slate-800 bg-[#131d33] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Paso 2 de 2 · Desafío Científico ({currentQuestion.nasaSource})
            </span>
            <span className="font-mono tabular-nums text-sky-300 font-semibold">
              Pregunta {questionIndex + 1} de {activeMission.questions.length}
            </span>
          </div>

          <h2 id="active-mission-title" className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {currentQuestion.prompt}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRight = idx === currentQuestion.correctIndex;

              let styleClass =
                'border-slate-700 bg-[#0d1629] text-slate-100 hover:border-sky-400/70';

              if (questionSolved && isRight) {
                styleClass = 'border-emerald-400 bg-emerald-500/15 text-white';
              } else if (isSelected && !isRight && !questionSolved) {
                styleClass = 'border-amber-400 bg-amber-500/15 text-amber-100';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={questionSolved}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors flex items-center gap-3.5 ${styleClass}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-slate-900 font-mono text-xs font-bold text-slate-200">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Retroalimentación positiva o pista amigable */}
          {selectedOption !== null && !questionSolved && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-amber-100">
                <p className="font-bold">¡Buen intento! Astro-Bot te ayuda con una pista:</p>
                <p className="mt-1 text-amber-200/90">{currentQuestion.hint}</p>
              </div>
            </div>
          )}

          {questionSolved && (
            <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-sm text-emerald-100">
                  <p className="font-bold">
                    ¡Excelente respuesta, Cadete! (+35 XP)
                  </p>
                  <p className="mt-1 text-emerald-100/90 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-sm font-bold hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>
                    {questionIndex + 1 < activeMission.questions.length
                      ? 'Siguiente pregunta'
                      : 'Completar misión'}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Etapa 3: Resumen Positivo de Misión */}
      {stage === 'summary' && (
        <div className="rounded-2xl border border-emerald-400/50 bg-[#132238] p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/60 bg-amber-400/15 text-amber-300">
            <Award className="w-9 h-9" aria-hidden="true" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <p className="text-xs font-semibold tracking-wide text-emerald-300">
              Misión {activeMission.number} completada
            </p>
            <h2 id="active-mission-title" className="text-2xl sm:text-3xl font-bold text-white">
              ¡Lo lograste! {activeMission.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Astro-Bot registró tu entrenamiento con éxito. Sumaste{' '}
              <span className="font-mono tabular-nums font-bold text-amber-300">
                +{sessionXp} XP
              </span>{' '}
              para subir de rango en tu viaje de la Luna a Marte.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenJournal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-bold hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              Abrir Diario de Logros
            </button>
            <button
              type="button"
              onClick={() => onSelectMission(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Elegir otra misión
            </button>
            <button
              type="button"
              onClick={resetLocalMissionState}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-300 text-sm font-medium hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Repetir</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
