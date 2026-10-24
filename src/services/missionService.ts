import {
  Mission,
  MissionCategoryInfo,
  AuthorizedSpecies,
} from '../types/mission';
import { Guest } from '../types/guest';
import { isMissionCompletedByGuest } from './guestService';
import {
  getOfficialArtworkUrl,
  getOfficialArtworkShinyUrl,
} from './pokeapi';

export const ELECTABUZZ_POKEMON_ID = 125;
export const SHINY_CHANCE_PERCENT = 10; // 10% de chance para as 22 espécies normais

/**
 * LISTA FECHADA DE ESPÉCIES AUTORIZADAS (Exatamente 23 Pokémon)
 */
export const AUTHORIZED_POKEMON_SPECIES_LIST: AuthorizedSpecies[] = [
  { id: 192, name: 'Sunflora', nationalDex: 192, canonicalMissionId: 'sunflora_jardim_felicidade' },
  { id: 315, name: 'Roselia', nationalDex: 315, canonicalMissionId: 'roselia_rosa_amizade' },
  { id: 407, name: 'Roserade', nationalDex: 407, canonicalMissionId: 'roserade_elegancia_flor' },
  { id: 421, name: 'Cherrim', nationalDex: 421, canonicalMissionId: 'cherrim_florescer_alegria' },
  { id: 548, name: 'Petilil', nationalDex: 548, canonicalMissionId: 'petilil_pequenos_detalhes' },
  { id: 549, name: 'Lilligant', nationalDex: 549, canonicalMissionId: 'lilligant_danca_flores' },
  { id: 669, name: 'Flabébé', nationalDex: 669, canonicalMissionId: 'flabebe_flor_especial' },
  { id: 670, name: 'Floette', nationalDex: 670, canonicalMissionId: 'floette_guardiao_buque' },
  { id: 671, name: 'Florges', nationalDex: 671, canonicalMissionId: 'florges_reino_flores' },
  { id: 764, name: 'Comfey', nationalDex: 764, canonicalMissionId: 'comfey_lacos_carinho' },
  { id: 753, name: 'Fomantis', nationalDex: 753, canonicalMissionId: 'fomantis_explorador_botanico' },
  { id: 754, name: 'Lurantis', nationalDex: 754, canonicalMissionId: 'lurantis_pose_campeao' },
  { id: 829, name: 'Gossifleur', nationalDex: 829, canonicalMissionId: 'gossifleur_vento_primavera' },
  { id: 830, name: 'Eldegoss', nationalDex: 830, canonicalMissionId: 'eldegoss_espalhando_felicidade' },
  { id: 182, name: 'Bellossom', nationalDex: 182, canonicalMissionId: 'bellossom_ritmo_tropical' },
  { id: 125, name: 'Electabuzz', nationalDex: 125, canonicalMissionId: 'electabuzz_choque_pista' },
  { id: 1, name: 'Bulbasaur', nationalDex: 1, canonicalMissionId: 'bulbasaur_semente_amor' },
  { id: 133, name: 'Eevee', nationalDex: 133, canonicalMissionId: 'eevee_foto_mesa' },
  { id: 227, name: 'Skarmory', nationalDex: 227, canonicalMissionId: 'skarmory_mensageiro_alado' },
  { id: 39, name: 'Jigglypuff', nationalDex: 39, canonicalMissionId: 'jigglypuff_karaoke_pokemon' },
  { id: 250, name: 'Ho-Oh', nationalDex: 250, canonicalMissionId: 'ho_oh_lenda_uniao' },
  { id: 297, name: 'Hariyama', nationalDex: 297, canonicalMissionId: 'hariyama_forca_amizade' },
  { id: 36, name: 'Clefable', nationalDex: 36, canonicalMissionId: 'clefable_foto_mirella' },
];

export const AUTHORIZED_POKEMON_IDS_SET = new Set<number>(
  AUTHORIZED_POKEMON_SPECIES_LIST.map((p) => p.id)
);

/**
 * Validação centralizada se o Pokémon pertence à lista fechada autorizada
 */
export function isAuthorizedSpecies(pokemonId: number): boolean {
  return AUTHORIZED_POKEMON_IDS_SET.has(pokemonId);
}

/**
 * Obtém a espécie autorizada pelo ID
 */
export function getAuthorizedSpeciesById(pokemonId: number): AuthorizedSpecies | undefined {
  return AUTHORIZED_POKEMON_SPECIES_LIST.find((s) => s.id === pokemonId);
}

/**
 * Sorteio seguro e determinístico de shiny
 * - Electabuzz lança erro caso chamado aqui pois sua regra concede as duas variantes garantidas sem sorteio.
 * - Demais 22 espécies: 10% de chance de shiny (90% normal).
 */
export function rollShinyVariant(
  pokemonId: number,
  rng: () => number = Math.random
): boolean {
  if (pokemonId === ELECTABUZZ_POKEMON_ID) {
    throw new Error(
      'A missão de Electabuzz não utiliza sorteio aleatório, pois concede garantidamente 1 normal e 1 shiny.'
    );
  }
  return rng() < (SHINY_CHANCE_PERCENT / 100);
}

export const MISSION_CATEGORIES: MissionCategoryInfo[] = [
  {
    key: 'FOTO',
    label: 'Fotos',
    icon: '📸',
    color: '#38BDF8',
  },
  {
    key: 'VIDEO',
    label: 'Vídeos',
    icon: '🎥',
    color: '#A855F7',
  },
  {
    key: 'NOIVOS',
    label: 'Noivos',
    icon: '👰🤵',
    color: '#EC4899',
  },
  {
    key: 'MINIJOGO',
    label: 'Minijogos',
    icon: '🎮',
    color: '#EAB308',
  },
];

/**
 * CATÁLOGO FECHADO DAS EXATAMENTE 23 MISSÕES CANÔNICAS
 * Cada missão vinculada estritamente a uma única espécie autorizada.
 */
export const INITIAL_MISSIONS: Mission[] = [
  // 1. Sunflora — Jardim de Felicidade
  {
    id: 'sunflora_jardim_felicidade',
    nome: 'Jardim de Felicidade',
    descricao: 'Encontre uma decoração floral e registre uma foto alegre da festa.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 1,
    ativa: true,
    recompensa: {
      pokemonId: 192,
      pokemonName: 'Sunflora',
      artworkUrl: getOfficialArtworkUrl(192),
      artworkShinyUrl: getOfficialArtworkShinyUrl(192),
      badgeTitle: 'Flor Solar',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 2. Roselia — Rosa da Amizade
  {
    id: 'roselia_rosa_amizade',
    nome: 'Rosa da Amizade',
    descricao: 'Tire uma foto com alguém que você conheceu durante o casamento.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 2,
    ativa: true,
    recompensa: {
      pokemonId: 315,
      pokemonName: 'Roselia',
      artworkUrl: getOfficialArtworkUrl(315),
      artworkShinyUrl: getOfficialArtworkShinyUrl(315),
      badgeTitle: 'Rosa da Amizade',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 3. Roserade — Elegância em Flor
  {
    id: 'roserade_elegancia_flor',
    nome: 'Elegância em Flor',
    descricao: 'Encontre e fotografe o detalhe floral mais elegante da decoração.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 3,
    ativa: true,
    recompensa: {
      pokemonId: 407,
      pokemonName: 'Roserade',
      artworkUrl: getOfficialArtworkUrl(407),
      artworkShinyUrl: getOfficialArtworkShinyUrl(407),
      badgeTitle: 'Elegância em Flor',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 4. Cherrim — Florescer da Alegria
  {
    id: 'cherrim_florescer_alegria',
    nome: 'Florescer da Alegria',
    descricao: 'Registre um sorriso espontâneo de alguém durante a festa.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 4,
    ativa: true,
    recompensa: {
      pokemonId: 421,
      pokemonName: 'Cherrim',
      artworkUrl: getOfficialArtworkUrl(421),
      artworkShinyUrl: getOfficialArtworkShinyUrl(421),
      badgeTitle: 'Sorriso Radiante',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 5. Petilil — Pequenos Detalhes
  {
    id: 'petilil_pequenos_detalhes',
    nome: 'Pequenos Detalhes',
    descricao: 'Descubra um pequeno detalhe da decoração que merece ser lembrado.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 5,
    ativa: true,
    recompensa: {
      pokemonId: 548,
      pokemonName: 'Petilil',
      artworkUrl: getOfficialArtworkUrl(548),
      artworkShinyUrl: getOfficialArtworkShinyUrl(548),
      badgeTitle: 'Olhar Atento',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 6. Lilligant — Dança das Flores
  {
    id: 'lilligant_danca_flores',
    nome: 'Dança das Flores',
    descricao: 'Convide alguém para dançar e registre o momento.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 6,
    ativa: true,
    recompensa: {
      pokemonId: 549,
      pokemonName: 'Lilligant',
      artworkUrl: getOfficialArtworkUrl(549),
      artworkShinyUrl: getOfficialArtworkShinyUrl(549),
      badgeTitle: 'Dança Graciosa',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 7. Flabébé — A Flor Especial
  {
    id: 'flabebe_flor_especial',
    nome: 'A Flor Especial',
    descricao: 'Encontre uma flor na decoração e identifique sua cor.',
    categoria: 'MINIJOGO',
    tipoValidacao: 'MINIJOGO_SCORE',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 7,
    ativa: true,
    recompensa: {
      pokemonId: 669,
      pokemonName: 'Flabébé',
      artworkUrl: getOfficialArtworkUrl(669),
      artworkShinyUrl: getOfficialArtworkShinyUrl(669),
      badgeTitle: 'Botânico Mirim',
    },
    gameConfig: {
      gameType: 'QUIZ_CASAL',
      targetScore: 1,
    },
  },

  // 8. Floette — Guardião do Buquê
  {
    id: 'floette_guardiao_buque',
    nome: 'Guardião do Buquê',
    descricao: 'Descubra onde o buquê está sendo guardado ou quem está com ele.',
    categoria: 'NOIVOS',
    tipoValidacao: 'CODIGO_NOIVOS',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 8,
    ativa: true,
    recompensa: {
      pokemonId: 670,
      pokemonName: 'Floette',
      artworkUrl: getOfficialArtworkUrl(670),
      artworkShinyUrl: getOfficialArtworkShinyUrl(670),
      badgeTitle: 'Protetor do Buquê',
    },
    codeConfig: {
      coupleType: 'CASAL',
      hint: 'Descubra quem está com o buquê dos noivos e solicite o código secreto!',
      acceptedCodes: ['BUQUE-FLORES-2026', 'BUQUE-MAGICO', 'GUARDIAO-BUQUE', 'BUQUE-2026'],
    },
  },

  // 9. Florges — Reino das Flores
  {
    id: 'florges_reino_flores',
    nome: 'Reino das Flores',
    descricao: 'Tire uma foto que destaque a decoração floral mais bonita do evento.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 9,
    ativa: true,
    recompensa: {
      pokemonId: 671,
      pokemonName: 'Florges',
      artworkUrl: getOfficialArtworkUrl(671),
      artworkShinyUrl: getOfficialArtworkShinyUrl(671),
      badgeTitle: 'Reino Floral',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 10. Comfey — Laços de Carinho
  {
    id: 'comfey_lacos_carinho',
    nome: 'Laços de Carinho',
    descricao: 'Registre um momento carinhoso entre familiares ou amigos.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 10,
    ativa: true,
    recompensa: {
      pokemonId: 764,
      pokemonName: 'Comfey',
      artworkUrl: getOfficialArtworkUrl(764),
      artworkShinyUrl: getOfficialArtworkShinyUrl(764),
      badgeTitle: 'Laços Afetivos',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 11. Fomantis — Explorador Botânico
  {
    id: 'fomantis_explorador_botanico',
    nome: 'Explorador Botânico',
    descricao: 'Encontre uma planta ou um elemento natural na decoração e registre-o.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 11,
    ativa: true,
    recompensa: {
      pokemonId: 753,
      pokemonName: 'Fomantis',
      artworkUrl: getOfficialArtworkUrl(753),
      artworkShinyUrl: getOfficialArtworkShinyUrl(753),
      badgeTitle: 'Toque da Natureza',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 12. Lurantis — Pose de Campeão
  {
    id: 'lurantis_pose_campeao',
    nome: 'Pose de Campeão',
    descricao: 'Faça uma pose criativa com outro convidado para uma foto temática.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 12,
    ativa: true,
    recompensa: {
      pokemonId: 754,
      pokemonName: 'Lurantis',
      artworkUrl: getOfficialArtworkUrl(754),
      artworkShinyUrl: getOfficialArtworkShinyUrl(754),
      badgeTitle: 'Pose Lendária',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 13. Gossifleur — Vento de Primavera
  {
    id: 'gossifleur_vento_primavera',
    nome: 'Vento de Primavera',
    descricao: 'Encontre uma decoração delicada e faça uma foto criativa com ela.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 13,
    ativa: true,
    recompensa: {
      pokemonId: 829,
      pokemonName: 'Gossifleur',
      artworkUrl: getOfficialArtworkUrl(829),
      artworkShinyUrl: getOfficialArtworkShinyUrl(829),
      badgeTitle: 'Brisa Primaveril',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 14. Eldegoss — Espalhando Felicidade
  {
    id: 'eldegoss_espalhando_felicidade',
    nome: 'Espalhando Felicidade',
    descricao: 'Diga algo gentil a três convidados e registre um momento da interação.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 14,
    ativa: true,
    recompensa: {
      pokemonId: 830,
      pokemonName: 'Eldegoss',
      artworkUrl: getOfficialArtworkUrl(830),
      artworkShinyUrl: getOfficialArtworkShinyUrl(830),
      badgeTitle: 'Espírito Generoso',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 15. Bellossom — Ritmo Tropical
  {
    id: 'bellossom_ritmo_tropical',
    nome: 'Ritmo Tropical',
    descricao: 'Dance com seu grupo e registre uma foto da comemoração.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 15,
    ativa: true,
    recompensa: {
      pokemonId: 182,
      pokemonName: 'Bellossom',
      artworkUrl: getOfficialArtworkUrl(182),
      artworkShinyUrl: getOfficialArtworkShinyUrl(182),
      badgeTitle: 'Ritmo da Alegria',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 16. Electabuzz — Choque na Pista (ESPECIAL: 1 NORMAL + 1 SHINY GARANTIDOS)
  {
    id: 'electabuzz_choque_pista',
    nome: 'Choque na Pista',
    descricao: 'Participe de uma dança na pista e obtenha a validação da missão conforme as regras do evento.',
    categoria: 'NOIVOS',
    tipoValidacao: 'CODIGO_NOIVOS',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 16,
    ativa: true,
    recompensa: {
      pokemonId: 125,
      pokemonName: 'Electabuzz',
      artworkUrl: getOfficialArtworkUrl(125),
      artworkShinyUrl: getOfficialArtworkShinyUrl(125),
      badgeTitle: 'Raio da Pista',
      isGuaranteedDoubleElectabuzz: true, // EXCEÇÃO OBRIGATÓRIA: Concede 2 capturas (Normal + Shiny)
    },
    codeConfig: {
      coupleType: 'JOAO',
      hint: 'Dance na pista com o João ou com o grupo e peça o código elétrico de dança!',
      acceptedCodes: ['PISTA-ELETRICA', 'JOAO-DANCA-SHOW', 'ELECTA-2026', 'CHOQUE-NA-PISTA'],
    },
  },

  // 17. Bulbasaur — A Semente do Amor
  {
    id: 'bulbasaur_semente_amor',
    nome: 'A Semente do Amor',
    descricao: 'Descubra uma curiosidade sobre a história do casal conversando com um familiar.',
    categoria: 'MINIJOGO',
    tipoValidacao: 'MINIJOGO_SCORE',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 17,
    ativa: true,
    recompensa: {
      pokemonId: 1,
      pokemonName: 'Bulbasaur',
      artworkUrl: getOfficialArtworkUrl(1),
      artworkShinyUrl: getOfficialArtworkShinyUrl(1),
      badgeTitle: 'Semente do Amor',
    },
    gameConfig: {
      gameType: 'QUIZ_CASAL',
      targetScore: 1,
    },
  },

  // 18. Eevee — Foto com a Mesa
  {
    id: 'eevee_foto_mesa',
    nome: 'Foto com a Mesa',
    descricao: 'Reúna as pessoas da sua mesa e registre uma foto da comemoração.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 18,
    ativa: true,
    recompensa: {
      pokemonId: 133,
      pokemonName: 'Eevee',
      artworkUrl: getOfficialArtworkUrl(133),
      artworkShinyUrl: getOfficialArtworkShinyUrl(133),
      badgeTitle: 'Espírito de Festa',
    },
    mediaConfig: {
      facingMode: 'environment',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 19. Skarmory — Mensageiro Alado
  {
    id: 'skarmory_mensageiro_alado',
    nome: 'Mensageiro Alado',
    descricao: 'Encontre um convidado que ainda não participou de uma missão e convide-o a participar.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 19,
    ativa: true,
    recompensa: {
      pokemonId: 227,
      pokemonName: 'Skarmory',
      artworkUrl: getOfficialArtworkUrl(227),
      artworkShinyUrl: getOfficialArtworkShinyUrl(227),
      badgeTitle: 'Mensageiro Alado',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 20. Jigglypuff — Karaokê Pokémon
  {
    id: 'jigglypuff_karaoke_pokemon',
    nome: 'Karaokê Pokémon',
    descricao: 'Cante um trecho de uma música com seu grupo ou grave um vídeo curto cantando.',
    categoria: 'VIDEO',
    tipoValidacao: 'UPLOAD_VIDEO',
    dificuldade: 'MEDIO',
    status: 'DISPONIVEL',
    ordem: 20,
    ativa: true,
    recompensa: {
      pokemonId: 39,
      pokemonName: 'Jigglypuff',
      artworkUrl: getOfficialArtworkUrl(39),
      artworkShinyUrl: getOfficialArtworkShinyUrl(39),
      badgeTitle: 'Voz da Noite',
    },
    mediaConfig: {
      facingMode: 'user',
      maxDurationSeconds: 30,
      requiresAudio: true,
    },
  },

  // 21. Ho-Oh — Lenda da União (MISSÃO SECRETA)
  {
    id: 'ho_oh_lenda_uniao',
    nome: '🔒 Lenda da União',
    descricao: 'Descubra uma mensagem especial preparada pelos noivos ou pela organização.',
    categoria: 'NOIVOS',
    tipoValidacao: 'CODIGO_NOIVOS',
    dificuldade: 'DIFICIL',
    status: 'BLOQUEADA',
    ordem: 21,
    ativa: true,
    isSecret: true,
    requisitos: [
      {
        type: 'QUANTIDADE_MISSOES',
        value: 5,
        description: 'Complete ao menos 5 missões para revelar a mensagem secreta dos noivos!',
      },
    ],
    recompensa: {
      pokemonId: 250,
      pokemonName: 'Ho-Oh',
      artworkUrl: getOfficialArtworkUrl(250),
      artworkShinyUrl: getOfficialArtworkShinyUrl(250),
      badgeTitle: 'Lenda da União',
    },
    codeConfig: {
      coupleType: 'CASAL',
      hint: 'Consulte os noivos para obter a palavra secreta da Lenda da União.',
      acceptedCodes: ['UNIAO-ETERNA-2026', 'HO-OH-LENDARIO', 'CASAL-JOAO-MIRELLA', 'LENDA-2026'],
    },
  },

  // 22. Hariyama — Força da Amizade
  {
    id: 'hariyama_forca_amizade',
    nome: 'Força da Amizade',
    descricao: 'Reúna três convidados para uma pose coletiva de equipe e registre o momento.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 22,
    ativa: true,
    recompensa: {
      pokemonId: 297,
      pokemonName: 'Hariyama',
      artworkUrl: getOfficialArtworkUrl(297),
      artworkShinyUrl: getOfficialArtworkShinyUrl(297),
      badgeTitle: 'Força da Amizade',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },

  // 23. Clefable — Foto com Mirella
  {
    id: 'clefable_foto_mirella',
    nome: 'Foto com Mirella',
    descricao: 'Encontre a noiva e tire uma selfie com ela.',
    categoria: 'FOTO',
    tipoValidacao: 'UPLOAD_FOTO',
    dificuldade: 'FACIL',
    status: 'DISPONIVEL',
    ordem: 23,
    ativa: true,
    recompensa: {
      pokemonId: 36,
      pokemonName: 'Clefable',
      artworkUrl: getOfficialArtworkUrl(36),
      artworkShinyUrl: getOfficialArtworkShinyUrl(36),
      badgeTitle: 'Madrinha Encantada',
    },
    mediaConfig: {
      facingMode: 'user',
      maxSizeBytes: 10 * 1024 * 1024,
      requiresAudio: false,
    },
  },
];

/**
 * Validação rigorosa de integridade do catálogo
 * Garante que:
 * 1. O catálogo tem exatamente 23 missões
 * 2. Há exatamente 23 espécies distintas
 * 3. Cada missão corresponde a uma espécie autorizada
 * 4. Nenhuma espécie não autorizada está presente
 */
export function validateCatalogIntegrity(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (INITIAL_MISSIONS.length !== 23) {
    errors.push(`O catálogo deve conter exatamente 23 missões (encontrado: ${INITIAL_MISSIONS.length}).`);
  }

  const seenPokemonIds = new Set<number>();
  for (const mission of INITIAL_MISSIONS) {
    const pId = mission.recompensa.pokemonId;
    if (!AUTHORIZED_POKEMON_IDS_SET.has(pId)) {
      errors.push(`Espécie não autorizada encontrada no catálogo: ID ${pId} (${mission.recompensa.pokemonName}).`);
    }
    if (seenPokemonIds.has(pId)) {
      errors.push(`Espécie duplicada encontrada no catálogo: ID ${pId} (${mission.recompensa.pokemonName}).`);
    }
    seenPokemonIds.add(pId);
  }

  if (seenPokemonIds.size !== 23) {
    errors.push(`Devem existir exatamente 23 espécies distintas (encontrado: ${seenPokemonIds.size}).`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Retorna as missões com o status atualizado de acordo com o perfil do convidado
 */
export function getMissionsForGuest(guest: Guest): Mission[] {
  const completedCount = Object.keys(guest.completedMissions).length;

  return INITIAL_MISSIONS.map((m) => {
    // 1. Se já concluída pelo convidado:
    if (isMissionCompletedByGuest(guest, m.id)) {
      return {
        ...m,
        status: 'CONCLUIDA',
        concluidaEm: guest.completedMissions[m.id].completedAt,
      };
    }

    // 2. Se for missão secreta ou dependente de requisitos:
    if (m.isSecret && m.requisitos) {
      const meetsAll = m.requisitos.every((req) => {
        if (req.type === 'QUANTIDADE_MISSOES') {
          return completedCount >= Number(req.value);
        }
        return true;
      });

      if (!meetsAll) {
        return { ...m, status: 'BLOQUEADA' };
      }

      // Desbloqueada!
      return {
        ...m,
        status: 'DISPONIVEL',
        nome: '✨ Lenda da União Revelada',
      };
    }

    return { ...m, status: 'DISPONIVEL' };
  });
}
