export interface GuestCapturedPokemon {
  pokemonId: number;
  pokemonName: string;
  isShiny: boolean;
  artworkUrl: string;
  capturedAt: string;
  sourceMissionId: string;
  nationalDexNumber: number;
}

export interface GuestMissionCompletion {
  missionId: string;
  completedAt: string;
  proofType: 'FOTO' | 'VIDEO' | 'CODIGO' | 'MINIJOGO';
  proofData?: string; // URL da mídia ou código utilizado
  rewardReceived: {
    pokemonId: number;
    pokemonName: string;
    isShiny?: boolean;
    artworkUrl?: string;
  };
  allRewardsReceived?: Array<{
    pokemonId: number;
    pokemonName: string;
    isShiny: boolean;
    artworkUrl: string;
  }>;
}

export interface Guest {
  id: string;
  nome: string;
  mesa?: string;
  createdAt: string;
  completedMissions: Record<string, GuestMissionCompletion>; // missionId -> completion
  capturedPokemons: GuestCapturedPokemon[];
}
