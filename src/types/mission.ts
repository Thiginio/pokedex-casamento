export type MissionCategory = 'FOTO' | 'VIDEO' | 'NOIVOS' | 'MINIJOGO';

export type MissionStatus =
  | 'BLOQUEADA'
  | 'DISPONIVEL'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_VALIDACAO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type ValidationType =
  | 'UPLOAD_FOTO'
  | 'UPLOAD_VIDEO'
  | 'CODIGO_NOIVOS'
  | 'MINIJOGO_SCORE';

export type MissionDifficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export interface AuthorizedSpecies {
  id: number;
  name: string;
  nationalDex: number;
  canonicalMissionId: string;
}

export interface MissionReward {
  pokemonId: number;
  pokemonName: string;
  artworkUrl?: string;
  artworkShinyUrl?: string;
  badgeTitle?: string;
  bonusPoints?: number;
  isGuaranteedDoubleElectabuzz?: boolean; // Regra especial: 1 normal + 1 shiny garantidos
}

export interface MissionRequirement {
  type: 'MISSAO_CONCLUIDA' | 'QUANTIDADE_MISSOES' | 'HORARIO' | 'POKEMON_CAPTURADO';
  value: string | number;
  description: string;
}

export interface MissionMediaConfig {
  facingMode?: 'user' | 'environment';
  maxDurationSeconds?: number; // Para vídeo
  maxSizeBytes?: number;
  requiresAudio?: boolean;
  acceptedFormats?: string[];
}

export interface MissionCodeConfig {
  coupleType: 'JOAO' | 'MIRELLA' | 'CASAL';
  hint: string;
  acceptedCodes: string[];
}

export interface MissionMinigameConfig {
  gameType: 'QUEM_E_ESSE_POKEMON' | 'QUIZ_CASAL' | 'MEMORIA' | 'FLOR_COR';
  targetScore: number;
  timeLimitSeconds?: number;
}

export interface Mission {
  id: string;
  nome: string;
  descricao: string;
  categoria: MissionCategory;
  tipoValidacao: ValidationType;
  dificuldade: MissionDifficulty;
  status: MissionStatus;
  ordem: number;
  ativa: boolean;
  isSecret?: boolean;
  requisitos?: MissionRequirement[];
  recompensa: MissionReward;
  mediaConfig?: MissionMediaConfig;
  codeConfig?: MissionCodeConfig;
  gameConfig?: MissionMinigameConfig;
  concluidaEm?: string;
}

export interface MissionCategoryInfo {
  key: MissionCategory;
  label: string;
  icon: string;
  color: string;
}
