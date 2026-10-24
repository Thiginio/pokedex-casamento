import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Guest, GuestCapturedPokemon } from '../../types/guest';
import {
  AUTHORIZED_POKEMON_SPECIES_LIST,
  INITIAL_MISSIONS,
} from '../../services/missionService';
import {
  getOfficialArtworkUrl,
  getOfficialArtworkShinyUrl,
} from '../../services/pokeapi';

interface CapturedPokemonsTabProps {
  guest: Guest;
  onViewInPokedex: (pokemonId: number) => void;
  onGoToMission: (missionId: string) => void;
}

type FilterType = 'TODOS' | 'CAPTURADOS' | 'BLOQUEADOS';

export const CapturedPokemonsTab: React.FC<CapturedPokemonsTabProps> = ({
  guest,
  onViewInPokedex,
  onGoToMission,
}) => {
  const [filter, setFilter] = useState<FilterType>('TODOS');

  const capturedList: GuestCapturedPokemon[] = guest.capturedPokemons || [];
  const capturedMap = new Map<number, GuestCapturedPokemon[]>();

  capturedList.forEach((cap) => {
    const existing = capturedMap.get(cap.pokemonId) || [];
    existing.push(cap);
    capturedMap.set(cap.pokemonId, existing);
  });

  const uniqueCapturedCount = capturedMap.size;
  const shinyCount = capturedList.filter((c) => c.isShiny).length;
  const totalSpecies = AUTHORIZED_POKEMON_SPECIES_LIST.length;

  const filteredSpecies = AUTHORIZED_POKEMON_SPECIES_LIST.filter((species) => {
    const isCaptured = capturedMap.has(species.id);
    if (filter === 'CAPTURADOS') return isCaptured;
    if (filter === 'BLOQUEADOS') return !isCaptured;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* 1. Header com Estatísticas da Coleção */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryTitle}>🏆 Coleção do Casamento</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {uniqueCapturedCount}/{totalSpecies} Registrados
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            ✓ Normais: <Text style={styles.statBold}>{uniqueCapturedCount}</Text>
          </Text>
          <Text style={styles.statItem}>
            ✨ Shiny: <Text style={styles.statShinyBold}>{shinyCount}</Text>
          </Text>
          <Text style={styles.statItem}>
            🔒 Faltam: <Text style={styles.statBold}>{totalSpecies - uniqueCapturedCount}</Text>
          </Text>
        </View>
      </View>

      {/* 2. Filtros Rápidos */}
      <View style={styles.filterRow}>
        {(['TODOS', 'CAPTURADOS', 'BLOQUEADOS'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}
            >
              {f === 'TODOS'
                ? `Todos (${totalSpecies})`
                : f === 'CAPTURADOS'
                ? `Capturados (${uniqueCapturedCount})`
                : `Bloqueados (${totalSpecies - uniqueCapturedCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Lista dos 23 Pokémon do Casamento */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpecies.map((species) => {
          const captures = capturedMap.get(species.id);
          const isCaptured = Boolean(captures && captures.length > 0);
          const hasShiny = Boolean(captures?.some((c) => c.isShiny));
          const mission = INITIAL_MISSIONS.find(
            (m) => m.recompensa.pokemonId === species.id
          );

          const artwork = hasShiny
            ? getOfficialArtworkShinyUrl(species.id)
            : getOfficialArtworkUrl(species.id);

          return (
            <View
              key={species.id}
              style={[
                styles.pokemonCard,
                isCaptured ? styles.pokemonCardCaptured : styles.pokemonCardLocked,
              ]}
            >
              {/* Imagem do Pokémon ou Ícone de Bloqueado */}
              <View style={styles.imageContainer}>
                {isCaptured ? (
                  <>
                    <Image
                      source={{ uri: artwork }}
                      style={styles.pokemonImage}
                      resizeMode="contain"
                    />
                    {hasShiny && (
                      <View style={styles.shinyTag}>
                        <Text style={styles.shinyTagText}>✨</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Image
                    source={require('../../../assets/blocked.png')}
                    style={styles.blockedImage}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Informações Centrais (Nome em Destaque Principal) */}
              <View style={styles.infoArea}>
                <View style={styles.titleLine}>
                  {/* O NOME É A IDENTIFICAÇÃO PRINCIPAL */}
                  <Text style={styles.pokemonName} numberOfLines={1}>
                    {species.name}
                  </Text>
                  {/* NÚMERO NACIONAL DA POKÉDEX EM ÁREA SECUNDÁRIA */}
                  <View style={styles.dexBadge}>
                    <Text style={styles.dexBadgeText}>
                      Nº {String(species.nationalDex).padStart(3, '0')}
                    </Text>
                  </View>
                </View>

                {isCaptured ? (
                  <View style={styles.capturedStatusRow}>
                    <Text style={styles.capturedStatusText}>
                      {hasShiny
                        ? '✨ Capturado (Versão Shiny!)'
                        : '✓ Capturado na Pokédex'}
                    </Text>
                    {captures && captures.length > 1 && (
                      <Text style={styles.duplicateCountText}>
                        ({captures.length} capturas)
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.lockedHintText} numberOfLines={1}>
                    {mission
                      ? `Missão: ${mission.nome}`
                      : 'Bloqueado — Complete a missão'}
                  </Text>
                )}
              </View>

              {/* Ação Direta */}
              <View style={styles.actionArea}>
                {isCaptured ? (
                  <TouchableOpacity
                    style={styles.viewDexBtn}
                    onPress={() => onViewInPokedex(species.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDexBtnText}>Ver Pokédex ⚡</Text>
                  </TouchableOpacity>
                ) : (
                  mission && (
                    <TouchableOpacity
                      style={styles.goToMissionBtn}
                      onPress={() => onGoToMission(mission.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.goToMissionBtnText}>Missão 🎯</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F141C',
    paddingHorizontal: 2,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryTitle: {
    color: '#F8FAFC',
    fontSize: 7.5,
    fontWeight: '900',
  },
  countBadge: {
    backgroundColor: '#15803D',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  countBadgeText: {
    color: '#BBF7D0',
    fontSize: 6.2,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    color: '#94A3B8',
    fontSize: 6.2,
  },
  statBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statShinyBold: {
    color: '#E879F9',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: '#161F2E',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#243447',
  },
  filterBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterBtnText: {
    color: '#94A3B8',
    fontSize: 6,
    fontWeight: 'bold',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 4,
  },
  pokemonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F2E',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginBottom: 2.5,
    borderWidth: 0.8,
    borderColor: '#223249',
  },
  pokemonCardCaptured: {
    backgroundColor: '#0A251B',
    borderColor: '#15803D',
  },
  pokemonCardLocked: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    opacity: 0.85,
  },
  imageContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    position: 'relative',
  },
  pokemonImage: {
    width: 24,
    height: 24,
  },
  blockedImage: {
    width: 18,
    height: 18,
  },
  shinyTag: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#9333EA',
    borderRadius: 6,
    paddingHorizontal: 1,
  },
  shinyTagText: {
    fontSize: 5,
  },
  infoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pokemonName: {
    color: '#F8FAFC',
    fontSize: 7.6,
    fontWeight: '900',
  },
  dexBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 2,
  },
  dexBadgeText: {
    color: '#54EDDE',
    fontSize: 5.8,
    fontWeight: 'bold',
  },
  capturedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 0.5,
  },
  capturedStatusText: {
    color: '#86EFAC',
    fontSize: 5.8,
    fontWeight: '600',
  },
  duplicateCountText: {
    color: '#FDE047',
    fontSize: 5.8,
    fontWeight: 'bold',
  },
  lockedHintText: {
    color: '#64748B',
    fontSize: 5.8,
    fontStyle: 'italic',
    marginTop: 0.5,
  },
  actionArea: {
    marginLeft: 4,
  },
  viewDexBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  viewDexBtnText: {
    color: '#FFFFFF',
    fontSize: 5.8,
    fontWeight: 'bold',
  },
  goToMissionBtn: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  goToMissionBtnText: {
    color: '#0F172A',
    fontSize: 5.8,
    fontWeight: 'bold',
  },
});
