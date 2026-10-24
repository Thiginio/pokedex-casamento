import {
  PokeApiResponse,
  Pokemon,
  PokemonListItem,
  PokemonTypeInfo,
  PokemonStatInfo,
  PokemonAbilityInfo,
  PokemonSpritesCollection,
} from '../types/pokemon';

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
export const RAW_SPRITES_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Cores temáticas oficiais de todos os 18 tipos Pokémon
export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// Traduções amigáveis de tipos para Português
export const POKEMON_TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  electric: 'Elétrico',
  grass: 'Planta',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Veneno',
  ground: 'Terra',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

// Nomes de atributos concisos (padrão RPG clássico)
export const POKEMON_STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  speed: 'VEL',
};

/**
 * Retorna o link direto da Artwork Oficial em alta resolução
 * Ex: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png
 */
export function getOfficialArtworkUrl(id: number | string): string {
  return `${RAW_SPRITES_BASE_URL}/other/official-artwork/${id}.png`;
}

/**
 * Retorna o link da Artwork Oficial Shiny (Brilhante)
 */
export function getOfficialArtworkShinyUrl(id: number | string): string {
  return `${RAW_SPRITES_BASE_URL}/other/official-artwork/shiny/${id}.png`;
}

/**
 * Retorna o sprite clássico pixel-art frontal padrão
 */
export function getPixelSpriteUrl(id: number | string): string {
  return `${RAW_SPRITES_BASE_URL}/${id}.png`;
}

/**
 * Retorna o sprite clássico pixel-art frontal Shiny
 */
export function getPixelSpriteShinyUrl(id: number | string): string {
  return `${RAW_SPRITES_BASE_URL}/shiny/${id}.png`;
}

/**
 * Retorna o sprite animado (Showdown GIF)
 */
export function getShowdownGifUrl(id: number | string): string {
  return `${RAW_SPRITES_BASE_URL}/other/showdown/${id}.gif`;
}

/**
 * Monta a coleção completa de sprites disponíveis para qualquer Pokémon ID
 */
export function buildSpritesCollection(
  id: number | string,
  raw?: PokeApiResponse['sprites']
): PokemonSpritesCollection {
  const idNum = String(id);

  return {
    officialArtwork:
      raw?.other?.['official-artwork']?.front_default ||
      getOfficialArtworkUrl(idNum),
    officialArtworkShiny:
      raw?.other?.['official-artwork']?.front_shiny ||
      getOfficialArtworkShinyUrl(idNum),
    frontDefault: raw?.front_default || getPixelSpriteUrl(idNum),
    frontShiny: raw?.front_shiny || getPixelSpriteShinyUrl(idNum),
    backDefault: raw?.back_default || `${RAW_SPRITES_BASE_URL}/back/${idNum}.png`,
    backShiny:
      raw?.back_shiny || `${RAW_SPRITES_BASE_URL}/back/shiny/${idNum}.png`,
    showdownAnimated:
      raw?.other?.showdown?.front_default || getShowdownGifUrl(idNum),
    showdownShiny:
      raw?.other?.showdown?.front_shiny ||
      `${RAW_SPRITES_BASE_URL}/other/showdown/shiny/${idNum}.gif`,
  };
}

/**
 * Formata o ID do Pokémon no padrão Pokédex (#001, #025, #150, #1025)
 */
export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

/**
 * Capitaliza primeira letra de qualquer nome
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Cache de Pokémons individuais em memória
const pokemonCache = new Map<string, Pokemon>();

// Cache do catálogo geral
let allPokemonCatalogCache: PokemonListItem[] | null = null;

/**
 * Transforma a resposta bruta da PokéAPI em um objeto completo e tipado
 */
function parsePokeApiResponse(data: PokeApiResponse): Pokemon {
  const types: PokemonTypeInfo[] = data.types.map((t) => ({
    name: t.type.name,
    label: POKEMON_TYPE_LABELS[t.type.name] || capitalize(t.type.name),
    color: POKEMON_TYPE_COLORS[t.type.name] || '#8A8A8A',
  }));

  const stats: PokemonStatInfo[] = data.stats.map((s) => ({
    name: s.stat.name,
    label: POKEMON_STAT_LABELS[s.stat.name] || s.stat.name.toUpperCase(),
    value: s.base_stat,
    max: 255,
  }));

  const totalStats = stats.reduce((acc, curr) => acc + curr.value, 0);

  const abilities: PokemonAbilityInfo[] = data.abilities.map((a) => ({
    name: a.ability.name,
    label: capitalize(a.ability.name.replace(/-/g, ' ')),
    isHidden: a.is_hidden,
  }));

  const sprites = buildSpritesCollection(data.id, data.sprites);

  return {
    id: data.id,
    name: data.name,
    displayName: capitalize(data.name),
    formattedId: formatPokemonId(data.id),
    heightMeters: data.height / 10,
    weightKg: data.weight / 10,
    baseExperience: data.base_experience || 0,
    types,
    stats,
    totalStats,
    abilities,
    sprites,
    officialArtwork: sprites.officialArtwork,
    spriteUrl: sprites.frontDefault,
    cryAudioUrl: data.cries?.latest || data.cries?.legacy || null,
  };
}

/**
 * Busca os dados completos e todos os sprites de QUALQUER Pokémon por ID ou nome
 * Suporta Pokémons de 1 a 1025+ (Bulbasaur, Pikachu, Mewtwo, Rayquaza, etc)
 * Exemplo: fetchPokemon(1), fetchPokemon(25), fetchPokemon('charizard')
 */
export async function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
  const query = String(idOrName).trim().toLowerCase();

  // Verifica cache em memória
  const cached = pokemonCache.get(query);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${query}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Pokémon "${idOrName}" não foi encontrado na PokéAPI.`);
    }
    throw new Error(`Erro ao conectar com a PokéAPI (Status ${response.status}).`);
  }

  const data: PokeApiResponse = await response.json();
  const parsed = parsePokeApiResponse(data);

  // Armazena no cache tanto pelo ID quanto pelo nome para consultas instantâneas
  pokemonCache.set(String(parsed.id), parsed);
  pokemonCache.set(parsed.name.toLowerCase(), parsed);

  return parsed;
}

/**
 * Busca uma lista paginada de Pokémons da PokéAPI (com artwork e sprites completos)
 */
export async function fetchPokemonList(
  limit: number = 20,
  offset: number = 0
): Promise<PokemonListItem[]> {
  const response = await fetch(
    `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar lista de Pokémon (Status ${response.status}).`);
  }

  const json = await response.json();

  return json.results.map((item: { name: string; url: string }) => {
    const urlParts = item.url.split('/').filter(Boolean);
    const id = parseInt(urlParts[urlParts.length - 1], 10) || 0;
    const sprites = buildSpritesCollection(id);

    return {
      id,
      name: item.name,
      displayName: capitalize(item.name),
      formattedId: formatPokemonId(id),
      officialArtwork: sprites.officialArtwork,
      spriteUrl: sprites.frontDefault || getPixelSpriteUrl(id),
      sprites,
      url: item.url,
    };
  });
}

/**
 * Carrega o catálogo completo de todos os Pokémons (1 a 1025)
 * Permite busca instantânea offline/em memória por qualquer nome ou número
 */
export async function fetchAllPokemonCatalog(limit: number = 1025): Promise<PokemonListItem[]> {
  if (allPokemonCatalogCache && allPokemonCatalogCache.length >= limit) {
    return allPokemonCatalogCache;
  }

  const list = await fetchPokemonList(limit, 0);
  allPokemonCatalogCache = list;
  return list;
}
