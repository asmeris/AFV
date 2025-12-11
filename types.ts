export enum AuraType {
  DIVINE_GOLD = 'Divine Gold',
  VOID_PURPLE = 'Void Purple',
  CYBER_CYAN = 'Cyber Cyan',
  INFERNO_RED = 'Inferno Red',
  NATURE_GREEN = 'Nature Green',
  CELESTIAL_WHITE = 'Celestial White'
}

export enum AspectRatio {
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9'
}

export enum TransformationType {
  NONE = 'NONE',
  MALE_TO_FEMALE = 'MALE_TO_FEMALE',
  FEMALE_TO_MALE = 'FEMALE_TO_MALE'
}

export interface GenerationConfig {
  prompt: string;
  auraType: AuraType;
  aspectRatio: AspectRatio;
  transformationType: TransformationType;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface VideoResult {
  uri: string;
  mimeType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}