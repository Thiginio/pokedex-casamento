import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { usePokemon } from '../hooks/usePokemon';
import { getOrCreateGuest } from '../services/guestService';
import {
  AUTHORIZED_POKEMON_SPECIES_LIST,
  isAuthorizedSpecies,
} from '../services/missionService';

export type SpriteMode = 'artwork' | 'showdown' | 'artworkShiny' | 'pixel';

const ORDERED_SPRITE_MODES: SpriteMode[] = [
  'artwork',
  'showdown',
  'artworkShiny',
  'pixel',
];

interface PokemonViewerProps {
  currentPokemonId?: number;
  onPokemonChange?: (id: number) => void;
  spriteMode?: SpriteMode;
  onSpriteModeChange?: (mode: SpriteMode) => void;
  initialPokemonId?: number;
}

export const PokemonViewer: React.FC<PokemonViewerProps> = ({
  currentPokemonId: externalId,
  onPokemonChange,
  spriteMode: externalSpriteMode,
  onSpriteModeChange,
  initialPokemonId = 192, // Sunflora (Missão 1 do casamento)
}) => {
  const [internalId, setInternalId] = useState<number>(initialPokemonId);
  const currentId = externalId !== undefined ? externalId : internalId;

  const setCurrentId = (id: number) => {
    if (onPokemonChange) {
      onPokemonChange(id);
    } else {
      setInternalId(id);
    }
  };

  const [internalSpriteMode, setInternalSpriteMode] = useState<SpriteMode>('artwork');
  const spriteMode = externalSpriteMode !== undefined ? externalSpriteMode : internalSpriteMode;

  const setSpriteMode = (mode: SpriteMode) => {
    if (onSpriteModeChange) {
      onSpriteModeChange(mode);
    } else {
      setInternalSpriteMode(mode);
    }
  };

  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Status de captura do convidado atual
  const guest = getOrCreateGuest();
  const capturedEntries = guest.capturedPokemons.filter((p) => p.pokemonId === currentId);
  const hasShiny = capturedEntries.some((p) => p.isShiny);
  const hasNormal = capturedEntries.some((p) => !p.isShiny);
  const isCurrentViewShiny = spriteMode === 'artworkShiny';
  // Passo 3: O bloqueio do shiny só sai se ele tirou na chance de 10% (ou Electabuzz)
  const isCurrentVariantLocked = isCurrentViewShiny ? !hasShiny : !hasNormal;
  const isAuthorized = isAuthorizedSpecies(currentId);

  const { pokemon, loading, error } = usePokemon(currentId);

  // Passo 2: Lista estritamente fechada dos 23 Pokémon autorizados do casamento
  const authorizedIds = AUTHORIZED_POKEMON_SPECIES_LIST.map((s) => s.id);
  const currentAuthIndex = authorizedIds.indexOf(currentId);

  const handleNext = () => {
    const idx = currentAuthIndex !== -1 ? currentAuthIndex : 0;
    const nextIndex = (idx + 1) % authorizedIds.length;
    setCurrentId(authorizedIds[nextIndex]);
  };

  const handlePrev = () => {
    const idx = currentAuthIndex !== -1 ? currentAuthIndex : 0;
    const prevIndex =
      (idx - 1 + authorizedIds.length) % authorizedIds.length;
    setCurrentId(authorizedIds[prevIndex]);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * authorizedIds.length);
    setCurrentId(authorizedIds[randomIndex]);
  };

  const handleSearchSubmit = () => {
    const term = searchInput.trim().toLowerCase();
    if (!term) {
      setIsSearching(false);
      return;
    }
    const num = parseInt(term, 10);
    // Busca estritamente entre os 23 Pokémon autorizados
    const matched = AUTHORIZED_POKEMON_SPECIES_LIST.find(
      (s) =>
        s.id === num ||
        s.nationalDex === num ||
        s.name.toLowerCase() === term
    );
    if (matched) {
      setCurrentId(matched.id);
    }
    setIsSearching(false);
    setSearchInput('');
  };

  const getActiveSprite = (): string => {
    if (!pokemon) return '';
    switch (spriteMode) {
      case 'showdown':
        return pokemon.sprites.showdownAnimated || pokemon.sprites.officialArtwork;
      case 'artworkShiny':
        return pokemon.sprites.officialArtworkShiny;
      case 'pixel':
        return pokemon.sprites.frontDefault || pokemon.sprites.officialArtwork;
      case 'artwork':
      default:
        return pokemon.sprites.officialArtwork;
    }
  };

  const cycleSpriteMode = () => {
    const nextIndex =
      (ORDERED_SPRITE_MODES.indexOf(spriteMode) + 1) % ORDERED_SPRITE_MODES.length;
    setSpriteMode(ORDERED_SPRITE_MODES[nextIndex]);
  };

  const getSpriteLabel = () => {
    switch (spriteMode) {
      case 'artwork':
        return 'Arte';
      case 'showdown':
        return '🎬 Gif';
      case 'artworkShiny':
        return '✨ Shiny';
      case 'pixel':
        return '👾 Pixel';
    }
  };

  const isShinyView = spriteMode === 'artworkShiny';

  return (
    <View style={styles.container}>
      {/* Barra superior de status / navegação */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setIsSearching(!isSearching)}
          style={styles.searchToggle}
        >
          <Text style={styles.searchToggleText}>
            {isSearching ? '✖' : '🔍'}
          </Text>
        </TouchableOpacity>

        {isSearching ? (
          <View style={styles.searchBar}>
            <TextInput
              style={styles.input}
              placeholder="Nº ou Nome (ex: 192, sunflora)"
              placeholderTextColor="#7E8B9B"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearchSubmit}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={handleSearchSubmit}
              style={styles.searchBtn}
            >
              <Text style={styles.searchBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.titleRow}>
            {/* O NOME É A IDENTIFICAÇÃO PRINCIPAL (REQUISITO DA SEÇÃO 6) */}
            <Text style={styles.pokemonNameHighlight} numberOfLines={1}>
              {pokemon?.displayName || 'Carregando...'}
            </Text>

            {/* O NÚMERO NACIONAL DA POKÉDEX EM ÁREA SECUNDÁRIA */}
            <View style={styles.secondaryDexBadge}>
              <Text style={styles.secondaryDexText}>
                Nº {String(pokemon?.id || currentId).padStart(3, '0')}
              </Text>
            </View>

            {/* INDICADOR VISUAL DE SHINY */}
            {(isShinyView || hasShiny) && (
              <View style={styles.shinyBadge}>
                <Text style={styles.shinyBadgeText}>✨ SHINY</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity onPress={handleRandom} style={styles.diceBtn}>
          <Text style={styles.diceText}>🎲</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo central: Sprite + Dados principais */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#54EDDE" />
            <Text style={styles.loadingText}>Buscando dados...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Não encontrado</Text>
            <TouchableOpacity onPress={handlePrev} style={styles.retryBtn}>
              <Text style={styles.retryText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pokemon && (
            <View style={styles.contentRow}>
              {/* Lado Esquerdo: Imagem / Sprite com indicador de Bloqueado / Capturado */}
              <View style={styles.spriteArea}>
                <View style={styles.spriteWrapper}>
                  <Image
                    source={{ uri: getActiveSprite() }}
                    style={[
                      styles.spriteImage,
                      isCurrentVariantLocked && styles.spriteLockedTint,
                    ]}
                    resizeMode="contain"
                  />

                  {/* CASO A VARIANTE ATUAL ESTEJA BLOQUEADA: PNG DE BLOQUEADO */}
                  {isCurrentVariantLocked && (
                    <View style={styles.blockedBadgeOverlay}>
                      <Image
                        source={require('../../assets/blocked.png')}
                        style={styles.blockedPngIcon}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>

                {/* Sub-barras do sprite: Alternar tipo e status na Pokédex */}
                <View style={styles.spriteMetaRow}>
                  <TouchableOpacity
                    onPress={cycleSpriteMode}
                    style={styles.spriteBadge}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.spriteBadgeText}>{getSpriteLabel()}</Text>
                  </TouchableOpacity>

                  {isCurrentVariantLocked ? (
                    <View style={styles.lockedStatusBadge}>
                      <Text style={styles.lockedStatusText}>🔒 Bloq.</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.captureStatusBadge,
                        isCurrentViewShiny && styles.captureStatusBadgeShiny,
                      ]}
                    >
                      <Text style={styles.captureStatusText}>
                        {isCurrentViewShiny ? '✨ Shiny' : '✓ Obtido'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Lado Direito: Informações e Atributos */}
              <View style={styles.detailsArea}>
                {/* Tipos e Tags */}
                <View style={styles.typesRow}>
                  {pokemon.types.map((t) => (
                    <View
                      key={t.name}
                      style={[styles.typeBadge, { backgroundColor: t.color }]}
                    >
                      <Text style={styles.typeText}>{t.label}</Text>
                    </View>
                  ))}
                  {isAuthorized && (
                    <View style={styles.weddingTag}>
                      <Text style={styles.weddingTagText}>💍 Casamento</Text>
                    </View>
                  )}
                </View>

                {/* Passo 3: Contadores 0/1 para Normal e para Shiny */}
                <View style={styles.countersRow}>
                  <View
                    style={[
                      styles.counterBadge,
                      hasNormal && styles.counterBadgeNormalActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.counterText,
                        hasNormal && styles.counterTextNormalActive,
                      ]}
                    >
                      {hasNormal ? '✓ 1/1 Normal' : '0/1 Normal'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.counterBadge,
                      hasShiny && styles.counterBadgeShinyActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.counterText,
                        hasShiny && styles.counterTextShinyActive,
                      ]}
                    >
                      {hasShiny ? '✨ 1/1 Shiny' : '✨ 0/1 Shiny'}
                    </Text>
                  </View>
                </View>

                {/* Altura / Peso */}
                <View style={styles.statsRow}>
                  <Text style={styles.metricText}>
                    Alt: {pokemon.heightMeters}m
                  </Text>
                  <Text style={styles.metricText}>
                    Peso: {pokemon.weightKg}kg
                  </Text>
                </View>

                {/* Mini Barras de Stats */}
                <View style={styles.miniStatsContainer}>
                  {pokemon.stats.slice(0, 3).map((st) => (
                    <View key={st.name} style={styles.statLine}>
                      <Text style={styles.statLabel}>{st.label}</Text>
                      <View style={styles.statBarBg}>
                        <View
                          style={[
                            styles.statBarFill,
                            {
                              width: `${Math.min(100, (st.value / 150) * 100)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.statNum}>{st.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )
        )}
      </View>

      {/* Barra Inferior: Navegação Anterior / Próximo (Passo 2: estritamente 23 pokemons) */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePrev}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>◀ Ant</Text>
        </TouchableOpacity>

        <Text style={styles.footerHint}>
          {currentAuthIndex !== -1
            ? `${currentAuthIndex + 1}/23 Casamento`
            : '1/23 Casamento'}
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Próx ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B0F14',
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1A232E',
    paddingBottom: 2,
  },
  searchToggle: {
    paddingHorizontal: 4,
  },
  searchToggleText: {
    fontSize: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#161F2A',
    color: '#FFFFFF',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#263445',
  },
  searchBtn: {
    backgroundColor: '#54EDDE',
    borderRadius: 4,
    marginLeft: 3,
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#082623',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
    gap: 4,
  },
  pokemonNameHighlight: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  secondaryDexBadge: {
    backgroundColor: '#16222F',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: '#243447',
  },
  secondaryDexText: {
    color: '#54EDDE',
    fontSize: 8,
    fontWeight: '700',
  },
  shinyBadge: {
    backgroundColor: '#7E22CE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: '#D8B4FE',
  },
  shinyBadgeText: {
    color: '#FAF5FF',
    fontSize: 7,
    fontWeight: '900',
  },
  diceBtn: {
    paddingHorizontal: 4,
  },
  diceText: {
    fontSize: 12,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E9AA8',
    fontSize: 10,
    marginTop: 4,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  retryText: {
    color: '#E2E8F0',
    fontSize: 9,
  },
  contentRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  spriteArea: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spriteWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteImage: {
    width: 64,
    height: 64,
  },
  spriteLockedTint: {
    opacity: 0.38,
  },
  blockedBadgeOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 1,
  },
  blockedPngIcon: {
    width: 22,
    height: 22,
  },
  spriteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
    maxWidth: 88,
  },
  spriteBadge: {
    backgroundColor: '#1B2633',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#334456',
  },
  spriteBadgeText: {
    color: '#A0B2C6',
    fontSize: 6.8,
    fontWeight: '700',
  },
  captureStatusBadge: {
    backgroundColor: '#14532D',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#22C55E',
  },
  captureStatusBadgeShiny: {
    backgroundColor: '#581C87',
    borderColor: '#A855F7',
  },
  captureStatusText: {
    color: '#BBF7D0',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  lockedStatusBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#475569',
  },
  lockedStatusText: {
    color: '#94A3B8',
    fontSize: 6.5,
    fontWeight: '600',
  },
  detailsArea: {
    flex: 1,
    paddingLeft: 4,
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden',
  },
  typesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  typeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 3,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 7.2,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  weddingTag: {
    backgroundColor: '#831843',
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: '#F472B6',
  },
  weddingTagText: {
    color: '#FDF2F8',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginVertical: 1,
  },
  counterBadge: {
    backgroundColor: '#161F2E',
    borderWidth: 0.8,
    borderColor: '#334155',
    borderRadius: 3,
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
  },
  counterBadgeNormalActive: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  counterBadgeShinyActive: {
    backgroundColor: '#4C1D95',
    borderColor: '#C084FC',
  },
  counterText: {
    color: '#64748B',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  counterTextNormalActive: {
    color: '#A7F3D0',
  },
  counterTextShinyActive: {
    color: '#F3E8FF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  metricText: {
    color: '#8E9AA8',
    fontSize: 7.2,
  },
  miniStatsContainer: {
    gap: 1.5,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: '#718096',
    fontSize: 6.8,
    width: 20,
    fontWeight: 'bold',
  },
  statBarBg: {
    flex: 1,
    height: 3.5,
    backgroundColor: '#1A232E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#38B2AC',
    borderRadius: 2,
  },
  statNum: {
    color: '#CBD5E0',
    fontSize: 6.8,
    width: 14,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A232E',
    paddingTop: 1,
  },
  navButton: {
    backgroundColor: '#16222F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#243447',
  },
  navButtonText: {
    color: '#54EDDE',
    fontSize: 9,
    fontWeight: 'bold',
  },
  footerHint: {
    color: '#59697B',
    fontSize: 8,
  },
});
