import astroBotImg from '../assets/images/astro_bot_guide_1794682644608.jpg';
import moonToMarsImg from '../assets/images/mission_moon_to_mars_1794682645041.jpg';
import spaceKitchenImg from '../assets/images/space_food_kitchen_1794682646847.jpg';
import veggieLabImg from '../assets/images/space_veggie_lab_1794682646412.jpg';
import {
  AchievementDefinition,
  AstronautRank,
  Mission,
  ScienceLogEntry,
  SpaceWeatherLevel,
  SpaceWeatherScenario,
} from '../types/game';

export const GAME_IMAGES = {
  astroBot: astroBotImg,
  moonToMars: moonToMarsImg,
  veggieLab: veggieLabImg,
  spaceKitchen: spaceKitchenImg,
};

export const SPACE_WEATHER_MOCK_DATA: Record<SpaceWeatherLevel, SpaceWeatherScenario> = {
  green: {
    level: 'green',
    label: 'Verde · Vuelo Nominal',
    shortStatus: 'Calma Solar',
    solarWindKms: 340,
    kpIndex: 2,
    radiationMsvDay: 0.42,
    protonFlux: 'Bajo (0.8 pfu)',
    source: 'NASA CCMC DONKI · OSDR RadLab',
    astroBotAdvice:
      'El Sol está tranquilo. Nuestro escudo magnético desvía sin esfuerzo las partículas cósmicas.',
    crewProtocol:
      'Caminatas espaciales, mantenimiento exterior y cosecha del invernadero Veggie autorizados.',
  },
  yellow: {
    level: 'yellow',
    label: 'Amarillo · Alerta Moderada',
    shortStatus: 'Viento Solar Elevado',
    solarWindKms: 580,
    kpIndex: 5,
    radiationMsvDay: 1.38,
    protonFlux: 'Moderado (18 pfu)',
    source: 'NASA CCMC DONKI · OSDR RadLab',
    astroBotAdvice:
      'Detectamos una corriente rápida de viento solar. Es momento de reforzar la energía del escudo.',
    crewProtocol:
      'Posponer caminatas espaciales largas y mantener a la tripulación dentro del módulo protegido.',
  },
  red: {
    level: 'red',
    label: 'Rojo · Tormenta Solar',
    shortStatus: 'Tormenta Geomagnética G4',
    solarWindKms: 910,
    kpIndex: 8,
    radiationMsvDay: 3.85,
    protonFlux: 'Alto (240 pfu)',
    source: 'NASA CCMC DONKI · OSDR RadLab',
    astroBotAdvice:
      '¡Eyección de masa coronal en camino! Activa el escudo al máximo y protege los cultivos Veggie.',
    crewProtocol:
      'Alerta máxima: toda la tripulación debe resguardarse en el refugio de agua contra radiación.',
  },
};

export const ASTRONAUT_RANKS: AstronautRank[] = [
  {
    level: 1,
    title: 'Cadete Lunar',
    minXp: 0,
    nextXp: 120,
    summary: 'Aprendiendo los controles básicos de la cápsula rumbo a la órbita lunar.',
  },
  {
    level: 2,
    title: 'Explorador Orbital',
    minXp: 120,
    nextXp: 260,
    summary: 'Dominas la lectura del Semáforo Cósmico y los sistemas de soporte vital.',
  },
  {
    level: 3,
    title: 'Oficial de Escudo',
    minXp: 260,
    nextXp: 440,
    summary: 'Experto en protección contra tormentas solares y agricultura espacial Veggie.',
  },
  {
    level: 4,
    title: 'Especialista en Marte',
    minXp: 440,
    nextXp: 650,
    summary: 'Preparado para viajes de larga duración con nutrición sin migajas y salud orbital.',
  },
  {
    level: 5,
    title: 'Comandante Guardián',
    minXp: 650,
    nextXp: null,
    summary: 'Máximo rango de entrenamiento. Lideras con éxito la expedición de la Luna a Marte.',
  },
];

export const MISSIONS: Mission[] = [
  {
    id: 'mission-shield',
    number: '01',
    title: 'Escudo Magnético y Clima Espacial',
    subtitle: 'Defiende la nave de tormentas solares usando datos de NASA CCMC DONKI y RadLab.',
    planetStage: 'Órbita Lunar',
    nasaSource: 'NASA CCMC DONKI · OSDR RadLab',
    xpReward: 120,
    imageUrl: GAME_IMAGES.moonToMars,
    imageAlt: 'Nave espacial protegida por un escudo magnético viajando de la Luna hacia Marte',
    miniLabType: 'shield',
    miniLabTitle: 'Calibración del Escudo Deflector',
    miniLabInstruction:
      'Ajusta la potencia del escudo magnético al 85% o más para resistir una ráfaga solar de 850 km/s sin desperdiciar energía.',
    questions: [
      {
        id: 'q-shield-1',
        prompt:
          'Cuando el Semáforo Cósmico cambia a Rojo por una tormenta solar, ¿qué material cotidiano ayuda a bloquear mejor la radiación en el refugio de la nave?',
        options: [
          'Tanques de agua y plásticos ricos en hidrógeno',
          'Papel aluminio delgado de cocina',
          'Ventanas de vidrio transparente sin recubrimiento',
        ],
        correctIndex: 0,
        explanation:
          '¡Exacto! El agua y el polietileno tienen muchos átomos de hidrógeno que frenan las partículas de radiación cósmica sin crear radiación secundaria peligrosa.',
        hint: 'Piensa en algo pesado que los astronautas ya llevan en grandes bolsas para beber y reciclar.',
        nasaSource: 'NASA OSDR RadLab',
      },
      {
        id: 'q-shield-2',
        prompt:
          '¿Qué mide el sistema NASA CCMC DONKI cuando alerta sobre el clima espacial rumbo a Marte?',
        options: [
          'Si va a llover o nevar en la superficie de Marte',
          'Vientos solares, llamaradas del Sol y tormentas geomagnéticas',
          'La temperatura del café dentro de la cocina espacial',
        ],
        correctIndex: 1,
        explanation:
          '¡Muy bien! DONKI vigila erupciones solares y eyecciones de masa coronal para avisar a los astronautas antes de que lleguen las partículas peligrosas.',
        hint: 'El clima espacial viene de la actividad de nuestra estrella más cercana: el Sol.',
        nasaSource: 'NASA CCMC DONKI',
      },
      {
        id: 'q-shield-3',
        prompt:
          '¿Por qué los astronautas reciben más radiación camino a Marte que viviendo en la Tierra?',
        options: [
          'Porque Marte está demasiado cerca del Sol',
          'Porque en el espacio profundo no nos protege la atmósfera ni el campo magnético terrestre',
          'Porque los cohetes pintados de blanco atraen la radiación',
        ],
        correctIndex: 1,
        explanation:
          '¡Brillante! La Tierra tiene un gran campo magnético y atmósfera que actúan como escudo natural; fuera de ella necesitamos alertas del Semáforo Cósmico.',
        hint: 'Nuestro planeta tiene dos capas invisibles que nos protegen todos los días.',
        nasaSource: 'NASA OSDR RadLab',
      },
    ],
  },
  {
    id: 'mission-veggie',
    number: '02',
    title: 'Invernadero Veggie y Agua Reciclada',
    subtitle: 'Cultiva alimentos frescos en microgravedad y cuida cada gota del ciclo hídrico.',
    planetStage: 'Tránsito Orbital',
    nasaSource: 'NASA OSDR Bio-Repository',
    xpReward: 130,
    imageUrl: GAME_IMAGES.veggieLab,
    imageAlt: 'Módulo espacial Veggie con lechugas y rábanos creciendo bajo luces LED',
    miniLabType: 'veggie',
    miniLabTitle: 'Control de Luces LED y Humedad Veggie',
    miniLabInstruction:
      'Enciende el espectro Rojo + Azul para la fotosíntesis y ajusta la humedad de la almohadilla entre 65% y 75%.',
    questions: [
      {
        id: 'q-veggie-1',
        prompt:
          'En el experimento Veggie de la NASA, ¿por qué las plantas crecen bajo luces LED de color rojo y azul que se ven violetas?',
        options: [
          'Para hacer que la cabina parezca una fiesta espacial',
          'Porque las hojas aprovechan mejor la luz roja y azul para hacer fotosíntesis y ahorrar energía',
          'Porque las bombillas verdes están prohibidas en los cohetes',
        ],
        correctIndex: 1,
        explanation:
          '¡Genial! La clorofila absorbe con máxima eficiencia la luz roja y azul, permitiendo cultivar lechugas y rábanos gastando menos electricidad de la nave.',
        hint: 'Las hojas verdes reflejan el verde y absorben otros dos colores principales.',
        nasaSource: 'NASA OSDR Bio-Repository',
      },
      {
        id: 'q-veggie-2',
        prompt:
          '¿Qué porcentaje aproximado de agua logra recuperar y purificar el sistema de reciclaje de la Estación Espacial para viajes largos?',
        options: [
          'Alrededor del 15%',
          'Cerca del 50%',
          'Hasta el 98% del agua usada por la tripulación',
        ],
        correctIndex: 2,
        explanation:
          '¡Impresionante! Casi el 98% del agua (incluida la humedad del aire y el sudor filtrado) se purifica hasta quedar más limpia que el agua potable en la Tierra.',
        hint: 'En un viaje a Marte no hay gasolineras ni ríos: casi toda el agua debe volver a usarse.',
        nasaSource: 'NASA ECLSS / Bio-Repository',
      },
      {
        id: 'q-veggie-3',
        prompt:
          '¿Qué ventaja extra tiene cultivar plantas frescas en el espacio además de dar vitaminas?',
        options: [
          'Ayuda al bienestar emocional y reduce el estrés de los astronautas',
          'Aumenta la gravedad dentro de la nave',
          'Sirve como combustible para los motores principales',
        ],
        correctIndex: 0,
        explanation:
          '¡Correcto! Cuidar plantas vivas conecta a los astronautas con la Tierra, mejora su ánimo y aporta textura fresca a su dieta.',
        hint: 'Piensa en cómo se siente cuidar un jardín cuando estás lejos de casa por meses.',
        nasaSource: 'NASA OSDR Bio-Repository',
      },
    ],
  },
  {
    id: 'mission-kitchen',
    number: '03',
    title: 'Cocina Sin Migajas en Gravedad Cero',
    subtitle: 'Prepara menús espaciales seguros inspirados en la Agencia Espacial Canadiense (CSA).',
    planetStage: 'Estación de Enlace',
    nasaSource: 'CSA Toolkit · Deep Space Food Challenge',
    xpReward: 130,
    imageUrl: GAME_IMAGES.spaceKitchen,
    imageAlt: 'Cocina espacial con tortillas suaves y bolsas selladas sin migajas flotantes',
    miniLabType: 'kitchen',
    miniLabTitle: 'Armado de Bandeja Cero Migajas',
    miniLabInstruction:
      'Selecciona los 3 alimentos seguros que NO sueltan migajas ni gotas sueltas en microgravedad.',
    questions: [
      {
        id: 'q-kitchen-1',
        prompt:
          '¿Por qué los astronautas usan tortillas suaves en lugar de pan tostado o galletas crujientes en el espacio?',
        options: [
          'Porque las tortillas se ven más bonitas flotando',
          'Porque las migajas flotan, pueden entrar en los ojos y tapar los filtros de aire de la nave',
          'Porque el horno espacial solo cocina comida redonda',
        ],
        correctIndex: 1,
        explanation:
          '¡Acertaste! Una pequeña migaja flotando puede dañar equipos electrónicos delicados o entrar en la nariz y los ojos de la tripulación.',
        hint: 'Imagina qué pasa con las migajas de un pan cuando no existe gravedad que las haga caer al suelo.',
        nasaSource: 'Agencia Espacial Canadiense (CSA)',
      },
      {
        id: 'q-kitchen-2',
        prompt:
          '¿Cómo usan sal y pimienta los astronautas sin que los granitos salgan volando por toda la cabina?',
        options: [
          'Disueltas en agua o aceite dentro de botellas gotero líquidas',
          'Lanzándolas al aire y atrapándolas con la boca',
          'Solo comen comida dulce sin condimentos',
        ],
        correctIndex: 0,
        explanation:
          '¡Excelente observación! En forma líquida las gotas se adhieren directamente a la comida y no flotan hacia los ventiladores.',
        hint: 'Si un polvo fino flota en el aire es peligroso, pero mezclado con un líquido se queda pegado.',
        nasaSource: 'CSA · Deep Space Food Challenge',
      },
      {
        id: 'q-kitchen-3',
        prompt:
          '¿Qué busca resolver el reto "Deep Space Food Challenge" de la NASA y la CSA para misiones a Marte?',
        options: [
          'Crear restaurantes de comida rápida en la Luna',
          'Producir alimentos nutritivos, deliciosos y con mínimos desechos usando poca agua y energía',
          'Enviar millones de cajas de cereal desde la Tierra cada semana',
        ],
        correctIndex: 1,
        explanation:
          '¡Exacto! En viajes de varios años a Marte, la tripulación necesita sistemas compactos que produzcan comida rica y saludable casi sin desperdicios.',
        hint: 'Un viaje a Marte tarda meses: necesitamos producir comida eficiente a bordo.',
        nasaSource: 'CSA Deep Space Food Challenge',
      },
    ],
  },
  {
    id: 'mission-body',
    number: '04',
    title: 'Cuerpo Sano Rumbo a Marte',
    subtitle: 'Combate la pérdida muscular y protege la visión SANS en viajes de larga duración.',
    planetStage: 'Órbita de Marte',
    nasaSource: 'NASA OSDR Bio-Repository · ARED & SANS',
    xpReward: 140,
    imageUrl: GAME_IMAGES.astroBot,
    imageAlt: 'Astro-Bot revisando indicadores biomédicos en la cabina de entrenamiento espacial',
    miniLabType: 'fitness',
    miniLabTitle: 'Rutina Diaria Antigravedad (ARED)',
    miniLabInstruction:
      'Completa la meta de entrenamiento diario ajustando los bloques de ejercicio hasta sumar al menos 150 minutos.',
    questions: [
      {
        id: 'q-body-1',
        prompt:
          '¿Cuántas horas aproximadas al día ejercitan los astronautas en máquinas especiales para que sus huesos y músculos no se debiliten?',
        options: [
          'Solo 10 minutos a la semana',
          'Alrededor de 2 horas y media todos los días',
          'No necesitan hacer ejercicio en el espacio',
        ],
        correctIndex: 1,
        explanation:
          '¡Súper bien! Sin gravedad, los músculos y huesos trabajan menos; por eso usan máquinas de resistencia ARED y cintas con arneses unas 2.5 horas diarias.',
        hint: 'Es mucho más tiempo que una clase corta de educación física: ¡deben entrenar cada día!',
        nasaSource: 'NASA OSDR Bio-Repository',
      },
      {
        id: 'q-body-2',
        prompt:
          '¿Qué es el fenómeno llamado SANS que los científicos de la NASA estudian en astronautas?',
        options: [
          'Cambios en la forma del ojo y la visión causados por fluidos que suben hacia la cabeza sin gravedad',
          'Un tipo de traje espacial de color naranja brillante',
          'El sonido que hacen los propulsores al aterrizar en Marte',
        ],
        correctIndex: 0,
        explanation:
          '¡Increíble conocimiento científico! En microgravedad los líquidos del cuerpo se desplazan hacia arriba, presionando suavemente los ojos y cambiando la agudeza visual.',
        hint: 'La sigla SANS incluye la palabra "Neuro-ocular", relacionada con nuestros ojos.',
        nasaSource: 'NASA OSDR Bio-Repository (SANS)',
      },
      {
        id: 'q-body-3',
        prompt:
          '¿Por qué el ejercicio en el espacio ayuda también a que los astronautas duerman mejor?',
        options: [
          'Porque cansa positivamente el cuerpo y ayuda a regular el ritmo biológico cuando ven 16 amaneceres al día',
          'Porque las máquinas de ejercicio apagan las luces del Sol',
          'Porque hace que la nave gire más lento',
        ],
        correctIndex: 0,
        explanation:
          '¡Correcto! En órbita el Sol sale y se pone cada 90 minutos, así que las rutinas fijas de ejercicio y luz ayudan a mantener un buen descanso.',
        hint: 'En la Estación Espacial ven muchísimos amaneceres en un solo día terrestre.',
        nasaSource: 'NASA Human Research Program',
      },
    ],
  },
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'ach-first-launch',
    title: 'Primer Despegue',
    description: 'Completaste tu primera misión oficial de entrenamiento espacial.',
    requirementText: 'Completa 1 misión de entrenamiento',
    category: 'Misiones',
    xpBonus: 40,
    targetCount: 1,
    targetTab: 'misiones',
    iconName: 'rocket',
  },
  {
    id: 'ach-solar-watcher',
    title: 'Vigilante Solar',
    description: 'Inspeccionaste los 3 estados del Semáforo Cósmico (Verde, Amarillo y Rojo).',
    requirementText: 'Prueba los 3 niveles del Semáforo Cósmico en el Centro de Mando',
    category: 'Clima Cósmico',
    xpBonus: 50,
    targetCount: 3,
    targetTab: 'mando',
    iconName: 'sun',
  },
  {
    id: 'ach-shield-master',
    title: 'Escudo Invencible',
    description: 'Dominaste el clima espacial y la protección contra radiación de NASA DONKI y RadLab.',
    requirementText: 'Completa la Misión 01: Escudo Magnético y Clima Espacial',
    category: 'Misiones',
    xpBonus: 60,
    targetCount: 1,
    targetTab: 'misiones',
    iconName: 'shield',
  },
  {
    id: 'ach-veggie-botanist',
    title: 'Botánico Espacial',
    description: 'Aprendiste a cultivar en microgravedad con el sistema Veggie y reciclaje de agua.',
    requirementText: 'Completa la Misión 02: Invernadero Veggie y Agua Reciclada',
    category: 'Misiones',
    xpBonus: 60,
    targetCount: 1,
    targetTab: 'misiones',
    iconName: 'sprout',
  },
  {
    id: 'ach-zero-g-chef',
    title: 'Chef de Gravedad Cero',
    description: 'Preparaste menús sin migajas siguiendo el protocolo de la Agencia Espacial Canadiense.',
    requirementText: 'Completa la Misión 03: Cocina Sin Migajas en Gravedad Cero',
    category: 'Misiones',
    xpBonus: 60,
    targetCount: 1,
    targetTab: 'misiones',
    iconName: 'utensils',
  },
  {
    id: 'ach-antigrav-athlete',
    title: 'Atleta Antigravedad',
    description: 'Superaste el entrenamiento físico ARED y los cuidados de visión SANS rumbo a Marte.',
    requirementText: 'Completa la Misión 04: Cuerpo Sano Rumbo a Marte',
    category: 'Misiones',
    xpBonus: 60,
    targetCount: 1,
    targetTab: 'misiones',
    iconName: 'dumbbell',
  },
  {
    id: 'ach-science-mind',
    title: 'Mente Científica',
    description: 'Respondiste correctamente tus primeras 5 preguntas basadas en ciencia de la NASA.',
    requirementText: 'Acierta 5 preguntas científicas en las misiones',
    category: 'Ciencia NASA',
    xpBonus: 50,
    targetCount: 5,
    targetTab: 'misiones',
    iconName: 'brain',
  },
  {
    id: 'ach-nasa-scholar',
    title: 'Sabio de la NASA',
    description: 'Demostraste dominio sobresaliente respondiendo 10 preguntas con datos reales.',
    requirementText: 'Acierta 10 preguntas científicas en las misiones',
    category: 'Ciencia NASA',
    xpBonus: 90,
    targetCount: 10,
    targetTab: 'misiones',
    iconName: 'award',
  },
  {
    id: 'ach-star-streak',
    title: 'Racha Estelar',
    description: 'Encadenaste 3 respuestas correctas seguidas al primer intento como un verdadero oficial.',
    requirementText: 'Logra una racha de 3 respuestas correctas seguidas',
    category: 'Entrenamiento',
    xpBonus: 55,
    targetCount: 3,
    targetTab: 'misiones',
    iconName: 'flame',
  },
  {
    id: 'ach-mars-commander',
    title: 'Comandante de Marte',
    description: 'Completaste todas las misiones de la Luna a Marte y protegiste a toda tu tripulación.',
    requirementText: 'Completa las 4 misiones principales de entrenamiento',
    category: 'Entrenamiento',
    xpBonus: 120,
    targetCount: 4,
    targetTab: 'misiones',
    iconName: 'compass',
  },
];

export const SCIENCE_LOG_ENTRIES: ScienceLogEntry[] = [
  {
    id: 'log-radlab',
    agency: 'NASA OSDR',
    dataset: 'RadLab · Dosimetría Cósmica',
    title: 'Cómo medimos la radiación invisible',
    summary:
      'El repositorio RadLab reúne mediciones reales de sensores a bordo de naves y estaciones espaciales para calcular cuánta radiación absorbe una tripulación fuera de la Tierra.',
    kidFact:
      'Un solo día viajando hacia Marte puede tener la misma radiación que varias semanas en la Estación Espacial Internacional, por eso las paredes con agua ayudan tanto.',
    imageUrl: GAME_IMAGES.moonToMars,
    imageAlt: 'Escudo de nave espacial desviando partículas solares entre la Luna y Marte',
  },
  {
    id: 'log-donki',
    agency: 'NASA CCMC',
    dataset: 'DONKI · Clima Espacial',
    title: 'Pronóstico del tiempo en el Sol',
    summary:
      'DONKI registra erupciones solares, viento solar rápido y tormentas geomagnéticas en tiempo real para dar aviso temprano a satélites y astronautas.',
    kidFact:
      'El Semáforo Cósmico de nuestro juego traduce las alertas de DONKI: cuando el índice geomagnético Kp sube mucho, los astronautas pasan a refugio seguro.',
    imageUrl: GAME_IMAGES.astroBot,
    imageAlt: 'Astro-Bot monitoreando alertas solares en la cabina espacial',
  },
  {
    id: 'log-biorepo',
    agency: 'NASA OSDR',
    dataset: 'Bio-Repository · Veggie & SANS',
    title: 'Plantas frescas y salud humana en órbita',
    summary:
      'Estudia cómo crecen cultivos como lechuga roja y rábanos en microgravedad, cómo reciclar hasta el 98% del agua y cómo proteger huesos, músculos y ojos (SANS).',
    kidFact:
      'En el espacio las raíces de las plantas no saben hacia dónde queda "abajo", así que usan la luz y almohadillas húmedas especiales para orientarse.',
    imageUrl: GAME_IMAGES.veggieLab,
    imageAlt: 'Invernadero espacial Veggie con cultivos hidropónicos',
  },
  {
    id: 'log-csa-food',
    agency: 'Agencia Espacial Canadiense (CSA)',
    dataset: 'Deep Space Food Challenge',
    title: 'Cocina inteligente sin migajas',
    summary:
      'La CSA diseña sistemas compactos para cultivar y cocinar alimentos deliciosos en el espacio profundo sin generar basura ni migajas peligrosas.',
    kidFact:
      'Las tortillas de harina reemplazaron al pan común en las naves espaciales porque se doblan sin soltar migas que puedan flotar hacia los filtros de aire.',
    imageUrl: GAME_IMAGES.spaceKitchen,
    imageAlt: 'Cocina de nave espacial con tortillas y bolsas de comida selladas',
  },
];

export function getAstronautRank(xp: number): AstronautRank {
  let current = ASTRONAUT_RANKS[0];
  for (const rank of ASTRONAUT_RANKS) {
    if (xp >= rank.minXp) {
      current = rank;
    }
  }
  return current;
}

export function getAchievementProgress(
  achievement: AchievementDefinition,
  progress: {
    completedMissionIds: string[];
    correctQuestionIds: string[];
    inspectedWeatherLevels: SpaceWeatherLevel[];
    bestStreak: number;
  }
): { current: number; target: number; unlocked: boolean } {
  let current = 0;
  switch (achievement.id) {
    case 'ach-first-launch':
      current = Math.min(1, progress.completedMissionIds.length);
      break;
    case 'ach-solar-watcher':
      current = progress.inspectedWeatherLevels.length;
      break;
    case 'ach-shield-master':
      current = progress.completedMissionIds.includes('mission-shield') ? 1 : 0;
      break;
    case 'ach-veggie-botanist':
      current = progress.completedMissionIds.includes('mission-veggie') ? 1 : 0;
      break;
    case 'ach-zero-g-chef':
      current = progress.completedMissionIds.includes('mission-kitchen') ? 1 : 0;
      break;
    case 'ach-antigrav-athlete':
      current = progress.completedMissionIds.includes('mission-body') ? 1 : 0;
      break;
    case 'ach-science-mind':
      current = Math.min(5, progress.correctQuestionIds.length);
      break;
    case 'ach-nasa-scholar':
      current = Math.min(10, progress.correctQuestionIds.length);
      break;
    case 'ach-star-streak':
      current = Math.min(3, progress.bestStreak);
      break;
    case 'ach-mars-commander':
      current = Math.min(4, progress.completedMissionIds.length);
      break;
    default:
      current = 0;
  }
  return {
    current,
    target: achievement.targetCount,
    unlocked: current >= achievement.targetCount,
  };
}
