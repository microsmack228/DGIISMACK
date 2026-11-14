import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, X } from 'lucide-react';
import { GAME_IMAGES } from '../data/gameData';

export interface GuideStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  actionTip: string;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

interface CadetGuideOverlayProps {
  isOpen: boolean;
  steps: GuideStep[];
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function CadetGuideOverlay({
  isOpen,
  steps,
  currentStepIndex,
  onNext,
  onPrev,
  onClose,
}: CadetGuideOverlayProps) {
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [imgErr, setImgErr] = useState(false);

  const step = steps[currentStepIndex];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, onClose, onNext, onPrev]);

  useLayoutEffect(() => {
    if (!isOpen || !step) return;

    const findVisibleTarget = () => {
      const candidates = Array.from(document.querySelectorAll(step.targetSelector));
      return (
        candidates.find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }) ?? null
      );
    };

    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const el = findVisibleTarget();
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    const targetEl = findVisibleTarget();
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    measure();
    const timer = window.setTimeout(measure, 320);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isOpen, step]);

  if (!isOpen || !step) return null;

  const isLast = currentStepIndex === steps.length - 1;
  const pad = 8;

  // Calcular posición segura del tooltip para que nunca se salga de la pantalla
  const tooltipWidth = Math.min(370, viewport.width - 32);
  const estimatedHeight = 250;

  let tooltipTop = Math.max(20, (viewport.height - estimatedHeight) / 2);
  let tooltipLeft = Math.max(16, (viewport.width - tooltipWidth) / 2);
  let placementLabel: 'top' | 'bottom' | 'center' = 'center';

  if (targetRect) {
    const spaceBelow = viewport.height - (targetRect.top + targetRect.height + pad);
    const spaceAbove = targetRect.top - pad;

    if (
      (step.preferredPlacement === 'bottom' || spaceBelow >= estimatedHeight + 16) &&
      spaceBelow >= 170
    ) {
      tooltipTop = Math.min(
        viewport.height - estimatedHeight - 16,
        targetRect.top + targetRect.height + 16
      );
      placementLabel = 'bottom';
    } else if (spaceAbove >= estimatedHeight + 16) {
      tooltipTop = Math.max(16, targetRect.top - estimatedHeight - 16);
      placementLabel = 'top';
    } else {
      tooltipTop = Math.max(16, viewport.height - estimatedHeight - 20);
      placementLabel = 'center';
    }

    const centeredLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    tooltipLeft = Math.max(16, Math.min(viewport.width - tooltipWidth - 16, centeredLeft));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadet-guide-title"
      className="fixed inset-0 z-50"
    >
      {/* Fondo oscurecido con foco sobre el elemento seleccionado */}
      {targetRect ? (
        <>
          <div
            className="fixed inset-0 bg-slate-950/75 transition-opacity duration-200"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="fixed rounded-2xl border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.72),0_0_30px_rgba(56,189,248,0.45)] pointer-events-none transition-all duration-200"
            style={{
              top: Math.max(4, targetRect.top - pad),
              left: Math.max(4, targetRect.left - pad),
              width: targetRect.width + pad * 2,
              height: targetRect.height + pad * 2,
            }}
          />
        </>
      ) : (
        <div
          className="fixed inset-0 bg-slate-950/80"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Tarjeta Tooltip flotante de la Guía del Cadete */}
      <div
        className="fixed z-50 rounded-2xl border border-sky-400/60 bg-[#131f38] p-5 shadow-2xl transition-all duration-200"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
      >
        {/* Flecha indicadora hacia el elemento */}
        {targetRect && placementLabel === 'bottom' && (
          <div
            aria-hidden="true"
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-l border-t border-sky-400/60 bg-[#131f38]"
          />
        )}
        {targetRect && placementLabel === 'top' && (
          <div
            aria-hidden="true"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-r border-b border-sky-400/60 bg-[#131f38]"
          />
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {!imgErr ? (
              <img
                src={GAME_IMAGES.astroBot}
                alt="Astro-Bot guía del cadete"
                referrerPolicy="no-referrer"
                onError={() => setImgErr(true)}
                className="h-11 w-11 rounded-xl object-cover border border-sky-400/50 shrink-0"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-sky-300" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sky-300 font-mono tabular-nums">
                Guía del Cadete · Paso {currentStepIndex + 1} de {steps.length}
              </p>
              <h3 id="cadet-guide-title" className="text-base font-bold text-white leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Guía del Cadete"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-200 leading-relaxed">{step.description}</p>

        <div className="mt-3 rounded-xl border border-slate-700/80 bg-[#0b1221] px-3.5 py-2.5 text-xs text-amber-200">
          <span className="font-bold text-amber-300">Tip de misión:</span> {step.actionTip}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Saltar guía
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Anterior</span>
              </button>
            )}
            <button
              type="button"
              onClick={isLast ? onClose : onNext}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{isLast ? '¡Comenzar aventura!' : 'Siguiente'}</span>
              {!isLast && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
