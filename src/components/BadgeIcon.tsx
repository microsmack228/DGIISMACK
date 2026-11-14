import {
  Award,
  Brain,
  Compass,
  Dumbbell,
  Flame,
  Rocket,
  Shield,
  Sprout,
  Sun,
  Utensils,
} from 'lucide-react';
import { AchievementDefinition } from '../types/game';

interface BadgeIconProps {
  name: AchievementDefinition['iconName'];
  className?: string;
}

export function BadgeIcon({ name, className = 'w-6 h-6' }: BadgeIconProps) {
  switch (name) {
    case 'rocket':
      return <Rocket className={className} aria-hidden="true" />;
    case 'sun':
      return <Sun className={className} aria-hidden="true" />;
    case 'shield':
      return <Shield className={className} aria-hidden="true" />;
    case 'sprout':
      return <Sprout className={className} aria-hidden="true" />;
    case 'utensils':
      return <Utensils className={className} aria-hidden="true" />;
    case 'dumbbell':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'brain':
      return <Brain className={className} aria-hidden="true" />;
    case 'award':
      return <Award className={className} aria-hidden="true" />;
    case 'flame':
      return <Flame className={className} aria-hidden="true" />;
    case 'compass':
      return <Compass className={className} aria-hidden="true" />;
  }
}
