import { AuraType } from './types';

export const AURA_PRESETS: Record<AuraType, { description: string, color: string, icon: string }> = {
  [AuraType.DIVINE_GOLD]: {
    description: "Radiant golden energy, floating particles of light, majestic and god-like presence, immense pressure.",
    color: "from-yellow-400 to-amber-600",
    icon: "✨"
  },
  [AuraType.VOID_PURPLE]: {
    description: "Dark purple swirling energy, gravity distortion, mysterious shadows, menacing and powerful atmosphere.",
    color: "from-purple-500 to-indigo-900",
    icon: "🔮"
  },
  [AuraType.CYBER_CYAN]: {
    description: "Neon blue electric arcs, digital glitch effects, futuristic hud elements, high-tech energy flow.",
    color: "from-cyan-400 to-blue-600",
    icon: "⚡"
  },
  [AuraType.INFERNO_RED]: {
    description: "Raging fire aura, heat distortion, rising embers, intense anger and power.",
    color: "from-red-500 to-orange-700",
    icon: "🔥"
  },
  [AuraType.NATURE_GREEN]: {
    description: "Swirling leaves and wind, vibrant green life energy, serene yet overwhelming power.",
    color: "from-green-400 to-emerald-700",
    icon: "🍃"
  },
  [AuraType.CELESTIAL_WHITE]: {
    description: "Pure blinding white light, angel wings composed of energy, calm and absolute dominance.",
    color: "from-gray-100 to-slate-300",
    icon: "🕊️"
  }
};

export const SAMPLE_PROMPTS = [
  "Walking slowly towards the camera with overwhelming pressure.",
  "Sitting on a throne looking down with absolute confidence.",
  "Charging up power before a massive burst of energy.",
  "Standing still while the environment reacts to the aura.",
  "Meditating in a floating position."
];
