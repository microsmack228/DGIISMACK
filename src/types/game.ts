export type SpaceWeatherLevel = 'green' | 'yellow' | 'red';

export interface SpaceWeatherScenario {
  level: SpaceWeatherLevel;
  label: string;
  shortStatus: string;
  solarWindKms: number;
  kpIndex: number;
  radiationMsvDay: number;
  protonFlux: string;
  source: string;
  astroBotAdvice: string;
  crewProtocol: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  nasaSource: string;
}

export type MiniLabType = 'shield' | 'veggie' | 'kitchen' | 'fitness';

export interface Mission {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  planetStage: string;
  nasaSource: string;
  xpReward: number;
  imageUrl: string;
  imageAlt: string;
  miniLabType: MiniLabType;
  miniLabTitle: string;
  miniLabInstruction: string;
  questions: QuizQuestion[];
}

export type AchievementCategory = 'Misiones' | 'Ciencia NASA' | 'Clima Cósmico' | 'Entrenamiento';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  category: AchievementCategory;
  xpBonus: number;
  targetCount: number;
  targetTab: 'misiones' | 'mando' | 'bitacora';
  iconName:
    | 'rocket'
    | 'sun'
    | 'shield'
    | 'sprout'
    | 'utensils'
    | 'dumbbell'
    | 'brain'
    | 'award'
    | 'flame'
    | 'compass';
}

export interface AstronautRank {
  level: number;
  title: string;
  minXp: number;
  nextXp: number | null;
  summary: string;
}

export interface ScienceLogEntry {
  id: string;
  agency: string;
  dataset: string;
  title: string;
  summary: string;
  kidFact: string;
  imageUrl: string;
  imageAlt: string;
}

export type SuitColor = 'sky' | 'amber' | 'emerald';

export interface PlayerProgress {
  cadetName: string;
  suitColor: SuitColor;
  hasSeenGuide: boolean;
  deckInteractions: string[];
  orbsCollected: number;
  xp: number;
  completedMissionIds: string[];
  correctQuestionIds: string[];
  exploredLogIds: string[];
  inspectedWeatherLevels: SpaceWeatherLevel[];
  bestStreak: number;
  currentStreak: number;
  completedMiniLabs: string[];
  unlockedAchievementIds: string[];
  unlockedAt: Record<string, string>;
}

export interface CelebrationNotification {
  id: string;
  type: 'achievement' | 'rank' | 'mission';
  title: string;
  message: string;
  xp?: number;
}
