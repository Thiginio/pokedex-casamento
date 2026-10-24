import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MissionReward } from '../../types/mission';
import { GuestCapturedPokemon } from '../../types/guest';

interface RewardModalProps {
  reward: MissionReward;
  missionTitle: string;
  rewardsList?: GuestCapturedPokemon[];
  isShiny?: boolean;
  onClose: () => void;
  onViewInPokedex?: (pokemonId: number) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  reward,
  missionTitle,
  rewardsList,
  isShiny: forceShiny,
  onClose,
  onViewInPokedex,
}) => {
  const isDoubleElectabuzz =
    reward.isGuaranteedDoubleElectabuzz || (rewardsList && rewardsList.length > 1);
  const isShiny = forceShiny || Boolean(rewardsList?.some((r) => r.isShiny));

  const displayArtwork = isShiny
    ? reward.artworkShinyUrl || reward.artworkUrl
    : reward.artworkUrl;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Banner de Celebração */}
        <View style={[styles.banner, isShiny && styles.bannerShiny]}>
          <Text style={[styles.bannerText, isShiny && styles.bannerTextShiny]}>
            {isDoubleElectabuzz
              ? '⚡ DUPLA CAPTURA GARANTIDA! ⚡'
              : isShiny
              ? '✨ SHINY LENDÁRIO CAPTURADO! ✨'
              : '✨ MISSÃO CONCLUÍDA! ✨'}
          </Text>
        </View>

        <Text style={styles.missionTitle} numberOfLines={1}>
          {missionTitle}
        </Text>

        {isDoubleElectabuzz && rewardsList ? (
          /* Renderização especial das 2 capturas garantidas de Electabuzz */
          <View style={styles.doubleRewardRow}>
            {rewardsList.map((cap, idx) => (
              <View key={idx} style={styles.doubleRewardItem}>
                <View
                  style={[
                    styles.imageContainer,
                    cap.isShiny && styles.imageContainerShiny,
                  ]}
                >
                  <Image
                    source={{ uri: cap.artworkUrl }}
                    style={styles.artworkSmall}
                    resizeMode="contain"
                  />
                  {cap.isShiny && (
                    <View style={styles.shinyPill}>
                      <Text style={styles.shinyPillText}>✨ SHINY</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pokemonNameHighlight}>
                  {cap.pokemonName}
                </Text>
                <Text style={styles.secondaryDexNumber}>
                  Nº {String(cap.pokemonId).padStart(3, '0')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          /* Renderização padrão com destaque principal para o NOME do Pokémon */
          <>
            <View
              style={[
                styles.imageContainer,
                isShiny && styles.imageContainerShiny,
              ]}
            >
              {displayArtwork ? (
                <Image
                  source={{ uri: displayArtwork }}
                  style={styles.artwork}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.pokeballIcon}>⚡</Text>
              )}
              {isShiny && (
                <View style={styles.shinyPill}>
                  <Text style={styles.shinyPillText}>✨ SHINY (10%)</Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              {/* O NOME É A IDENTIFICAÇÃO PRINCIPAL */}
              <Text style={styles.pokemonNameHighlight}>
                {reward.pokemonName}
              </Text>
              {/* NÚMERO NACIONAL EM ÁREA SECUNDÁRIA */}
              <Text style={styles.secondaryDexNumber}>
                Nº {String(reward.pokemonId).padStart(3, '0')}
              </Text>

              {reward.badgeTitle && (
                <Text style={styles.badgeTitle}>🏅 {reward.badgeTitle}</Text>
              )}
              <Text style={styles.congratsText}>
                {isShiny
                  ? 'Incrível! Você encontrou uma raríssima versão Shiny!'
                  : 'Registrado com sucesso na sua Pokédex do Casamento!'}
              </Text>
            </View>
          </>
        )}

        <View style={styles.buttonRow}>
          {onViewInPokedex && (
            <TouchableOpacity
              style={styles.pokedexBtn}
              onPress={() => onViewInPokedex(reward.pokemonId)}
              activeOpacity={0.8}
            >
              <Text style={styles.pokedexBtnText}>⚡ Ver Pokédex</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 15, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  card: {
    width: '100%',
    maxWidth: 228,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  banner: {
    backgroundColor: '#854D0E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    marginBottom: 4,
  },
  bannerShiny: {
    backgroundColor: '#6B21A8',
    borderColor: '#C084FC',
  },
  bannerText: {
    color: '#FEF08A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerTextShiny: {
    color: '#F3E8FF',
  },
  missionTitle: {
    color: '#94A3B8',
    fontSize: 7.5,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#FACC15',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  imageContainerShiny: {
    borderColor: '#A855F7',
    backgroundColor: '#2E1065',
  },
  artwork: {
    width: 58,
    height: 58,
  },
  artworkSmall: {
    width: 46,
    height: 46,
  },
  shinyPill: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: '#9333EA',
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#E9D5FF',
  },
  shinyPillText: {
    color: '#FFFFFF',
    fontSize: 5.5,
    fontWeight: '900',
  },
  pokeballIcon: {
    fontSize: 24,
  },
  infoBox: {
    alignItems: 'center',
    marginVertical: 2,
  },
  pokemonNameHighlight: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryDexNumber: {
    color: '#54EDDE',
    fontSize: 7.5,
    fontWeight: 'bold',
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 1,
    marginBottom: 2,
  },
  badgeTitle: {
    color: '#38BDF8',
    fontSize: 7.5,
    fontWeight: '700',
    marginTop: 1,
  },
  congratsText: {
    color: '#86EFAC',
    fontSize: 6.8,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  doubleRewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 4,
  },
  doubleRewardItem: {
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    width: '100%',
  },
  pokedexBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  pokedexBtnText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
});
