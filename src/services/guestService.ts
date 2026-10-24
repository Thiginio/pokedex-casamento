import { Guest, GuestMissionCompletion, GuestCapturedPokemon } from '../types/guest';
import { Mission } from '../types/mission';
import {
  ELECTABUZZ_POKEMON_ID,
  isAuthorizedSpecies,
  rollShinyVariant,
  INITIAL_MISSIONS,
} from './missionService';
import {
  getOfficialArtworkUrl,
  getOfficialArtworkShinyUrl,
} from './pokeapi';

const GUEST_STORAGE_KEY = 'pokedex_casamento_guest_v1';

/**
 * Sanitiza e migra dados pré-existentes de convidados
 * - Preserva histórico de capturas e convidados legítimos
 * - Garante que campos novos (isShiny, artworkUrl, nationalDexNumber) estejam presentes
 * - Não remove dados sem necessidade
 */
export function migrateGuestData(guest: Guest): Guest {
  const sanitizedCapturedPokemons: GuestCapturedPokemon[] = (guest.capturedPokemons || []).map(
    (cap) => {
      const isShiny = Boolean(cap.isShiny);
      const artwork = cap.artworkUrl || (isShiny
        ? getOfficialArtworkShinyUrl(cap.pokemonId)
        : getOfficialArtworkUrl(cap.pokemonId));

      return {
        pokemonId: cap.pokemonId,
        pokemonName: cap.pokemonName,
        isShiny,
        artworkUrl: artwork,
        capturedAt: cap.capturedAt || new Date().toISOString(),
        sourceMissionId: cap.sourceMissionId || 'legacy_migration',
        nationalDexNumber: cap.nationalDexNumber || cap.pokemonId,
      };
    }
  );

  return {
    ...guest,
    capturedPokemons: sanitizedCapturedPokemons,
  };
}

/**
 * Cria ou recupera o perfil do convidado atual no navegador
 */
export function getOrCreateGuest(): Guest {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Guest;
        const migrated = migrateGuestData(parsed);
        // Salva se migrou para persistir integridade
        if (JSON.stringify(migrated) !== stored) {
          saveGuest(migrated);
        }
        return migrated;
      }
    } catch (e) {
      console.warn('Erro ao ler dados do convidado do localStorage:', e);
    }
  }

  // Gera perfil padrão inicial para o convidado
  const newGuest: Guest = {
    id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    nome: 'Convidado de Honra',
    mesa: 'Mesa dos Amigos',
    createdAt: new Date().toISOString(),
    completedMissions: {},
    capturedPokemons: [],
  };

  saveGuest(newGuest);
  return newGuest;
}

/**
 * Salva os dados do convidado de forma segura
 */
export function saveGuest(guest: Guest): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
    } catch (e) {
      console.warn('Erro ao salvar dados do convidado no localStorage:', e);
    }
  }
}

/**
 * Verifica se a missão já foi concluída pelo convidado (Prevenção de Duplicidade)
 */
export function isMissionCompletedByGuest(guest: Guest, missionId: string): boolean {
  return Boolean(guest.completedMissions && guest.completedMissions[missionId]);
}

export interface CompleteMissionResult {
  updatedGuest: Guest;
  rewards: GuestCapturedPokemon[];
  isShiny: boolean;
}

/**
 * Registra a conclusão com validação rigorosa de segurança no backend/service:
 * 1. Verifica se a missão existe no catálogo
 * 2. Verifica se a missão já foi concluída (idempotência e prevenção de duplicidade)
 * 3. Valida se a espécie da recompensa pertence à lista fechada autorizada (23 espécies)
 * 4. Aplica a regra de Electabuzz (exceção única: 1 normal + 1 shiny garantidos)
 * 5. Aplica sorteio de shiny (10% de chance) nas demais 22 espécies
 * 6. Persiste variantes sorteadas e registros de conclusão
 */
export function completeMissionForGuest(
  guest: Guest,
  mission: Mission,
  proofType: 'FOTO' | 'VIDEO' | 'CODIGO' | 'MINIJOGO',
  proofData?: string,
  rng: () => number = Math.random
): CompleteMissionResult {
  // 1. Verificação de integridade da missão no catálogo
  const canonicalMission = INITIAL_MISSIONS.find((m) => m.id === mission.id);
  if (!canonicalMission) {
    throw new Error(`Missão inválida ou não reconhecida no catálogo: "${mission.id}".`);
  }

  // 2. Prevenção estrita de duplicidade (idempotência)
  if (isMissionCompletedByGuest(guest, canonicalMission.id)) {
    throw new Error('Esta missão já foi concluída por você! Recompensa não pode ser duplicada.');
  }

  // 3. Validação centralizada da espécie na lista fechada de 23 Pokémon autorizados
  const pokemonId = canonicalMission.recompensa.pokemonId;
  if (!isAuthorizedSpecies(pokemonId)) {
    throw new Error(
      `Espécie Pokémon #${pokemonId} (${canonicalMission.recompensa.pokemonName}) não é autorizada no catálogo do casamento.`
    );
  }

  const newCaptures: GuestCapturedPokemon[] = [];
  let isAnyShiny = false;

  // 4. REGRA ESPECIAL DE ELECTABUZZ (125): 2 capturas garantidas (1 normal + 1 shiny)
  if (pokemonId === ELECTABUZZ_POKEMON_ID || canonicalMission.recompensa.isGuaranteedDoubleElectabuzz) {
    // Captura 1: Normal
    const normalCapture: GuestCapturedPokemon = {
      pokemonId: ELECTABUZZ_POKEMON_ID,
      pokemonName: 'Electabuzz',
      isShiny: false,
      artworkUrl: getOfficialArtworkUrl(ELECTABUZZ_POKEMON_ID),
      capturedAt: new Date().toISOString(),
      sourceMissionId: canonicalMission.id,
      nationalDexNumber: 125,
    };

    // Captura 2: Shiny
    const shinyCapture: GuestCapturedPokemon = {
      pokemonId: ELECTABUZZ_POKEMON_ID,
      pokemonName: 'Electabuzz',
      isShiny: true,
      artworkUrl: getOfficialArtworkShinyUrl(ELECTABUZZ_POKEMON_ID),
      capturedAt: new Date().toISOString(),
      sourceMissionId: canonicalMission.id,
      nationalDexNumber: 125,
    };

    newCaptures.push(normalCapture, shinyCapture);
    isAnyShiny = true;
  } else {
    // 5. REGRA PADRÃO (22 espécies): Sorteio exclusivo no backend de 10% shiny
    const isShiny = rollShinyVariant(pokemonId, rng);
    isAnyShiny = isShiny;

    const capture: GuestCapturedPokemon = {
      pokemonId,
      pokemonName: canonicalMission.recompensa.pokemonName,
      isShiny,
      artworkUrl: isShiny
        ? getOfficialArtworkShinyUrl(pokemonId)
        : getOfficialArtworkUrl(pokemonId),
      capturedAt: new Date().toISOString(),
      sourceMissionId: canonicalMission.id,
      nationalDexNumber: pokemonId,
    };

    newCaptures.push(capture);
  }

  const completion: GuestMissionCompletion = {
    missionId: canonicalMission.id,
    completedAt: new Date().toISOString(),
    proofType,
    proofData,
    rewardReceived: {
      pokemonId,
      pokemonName: canonicalMission.recompensa.pokemonName,
      isShiny: isAnyShiny,
      artworkUrl: newCaptures[0]?.artworkUrl,
    },
    allRewardsReceived: newCaptures.map((c) => ({
      pokemonId: c.pokemonId,
      pokemonName: c.pokemonName,
      isShiny: c.isShiny,
      artworkUrl: c.artworkUrl,
    })),
  };

  const updatedGuest: Guest = {
    ...guest,
    completedMissions: {
      ...guest.completedMissions,
      [canonicalMission.id]: completion,
    },
    capturedPokemons: [...guest.capturedPokemons, ...newCaptures],
  };

  saveGuest(updatedGuest);

  return {
    updatedGuest,
    rewards: newCaptures,
    isShiny: isAnyShiny,
  };
}
