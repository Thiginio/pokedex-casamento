// Raw PokéAPI response types
export interface PokeApiTypeItem {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokeApiStatItem {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokeApiAbilityItem {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokeApiSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    showdown?: {
      front_default: string | null;
      front_shiny?: string | null;
      back_default?: string | null;
      back_shiny?: string | null;
    };
    home?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
  };
}

export interface PokeApiCries {
  latest?: string;
  legacy?: string;
}

export interface PokeApiResponse {
  id: number;
  name: string;
  base_experience?: number;
  height: number;
  weight: number;
  types: PokeApiTypeItem[];
  stats: PokeApiStatItem[];
  abilities: PokeApiAbilityItem[];
  sprites: PokeApiSprites;
  cries?: PokeApiCries;
}

// Clean model for UI & Project components
export interface PokemonTypeInfo {
  name: string;
  label: string;
  color: string;
}

export interface PokemonStatInfo {
  name: string;
  label: string;
  value: number;
  max: number;
}

export interface PokemonAbilityInfo {
  name: string;
  label: string;
  isHidden: boolean;
}

export interface PokemonSpritesCollection {
  officialArtwork: string;
  officialArtworkShiny: string;
  frontDefault: string | null;
  frontShiny: string | null;
  backDefault: string | null;
  backShiny: string | null;
  showdownAnimated: string | null;
  showdownShiny: string | null;
}

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  formattedId: string;
  heightMeters: number;
  weightKg: number;
  baseExperience: number;
  types: PokemonTypeInfo[];
  stats: PokemonStatInfo[];
  totalStats: number;
  abilities: PokemonAbilityInfo[];
  sprites: PokemonSpritesCollection;
  // Atalhos de acesso rápido
  officialArtwork: string;
  spriteUrl: string | null;
  cryAudioUrl: string | null;
}

export interface PokemonListItem {
  id: number;
  name: string;
  displayName: string;
  formattedId: string;
  officialArtwork: string;
  spriteUrl: string;
  sprites: PokemonSpritesCollection;
  url: string;
}
