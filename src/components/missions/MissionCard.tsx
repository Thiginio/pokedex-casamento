import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Mission } from '../../types/mission';

interface MissionCardProps {
  mission: Mission;
  onPress: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onPress,
}) => {
  const isCompleted = mission.status === 'CONCLUIDA';
  const isLocked = mission.status === 'BLOQUEADA';

  const difficultyColors = {
    FACIL: '#22C55E',
    MEDIO: '#EAB308',
    DIFICIL: '#EF4444',
  };

  const getActionLabel = () => {
    if (isCompleted) return '✓ CONCLUÍDA';
    if (isLocked) return '🔒 BLOQUEADA';
    if (mission.tipoValidacao === 'UPLOAD_FOTO') return '📸 TIRAR FOTO';
    if (mission.tipoValidacao === 'UPLOAD_VIDEO') return '🎥 GRAVAR VÍDEO';
    if (mission.tipoValidacao === 'CODIGO_NOIVOS') return '🔑 INSERIR CÓDIGO';
    return '🎮 JOGAR';
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
        isLocked && styles.cardLocked,
      ]}
      onPress={onPress}
      activeOpacity={isLocked ? 1 : 0.75}
      disabled={isLocked}
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
              isLocked && styles.titleLocked,
            ]}
            numberOfLines={1}
          >
            {mission.nome}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.diffBadge,
              { borderColor: difficultyColors[mission.dificuldade] },
            ]}
          >
            <Text
              style={[
                styles.diffText,
                { color: difficultyColors[mission.dificuldade] },
              ]}
            >
              {mission.dificuldade}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[styles.description, isLocked && styles.descriptionLocked]}
        numberOfLines={2}
      >
        {isLocked && mission.requisitos?.[0]
          ? `🔒 ${mission.requisitos[0].description}`
          : mission.descricao}
      </Text>

      <View style={styles.bottomRow}>
        {/* Recompensa */}
        <View style={styles.rewardBox}>
          {isLocked ? (
            <Image
              source={require('../../../assets/blocked.png')}
              style={styles.rewardImage}
              resizeMode="contain"
            />
          ) : mission.recompensa.artworkUrl ? (
            <Image
              source={{ uri: mission.recompensa.artworkUrl }}
              style={styles.rewardImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.rewardIcon}>⚡</Text>
          )}
          <Text style={styles.rewardName} numberOfLines={1}>
            {isLocked ? 'Bloqueado' : mission.recompensa.pokemonName}
          </Text>
        </View>

        {/* Botão de Status / Ação */}
        <View
          style={[
            styles.actionBadge,
            isCompleted && styles.actionCompleted,
            isLocked && styles.actionLocked,
          ]}
        >
          <Text
            style={[
              styles.actionText,
              isCompleted && styles.actionTextCompleted,
              isLocked && styles.actionTextLocked,
            ]}
          >
            {getActionLabel()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161F2E',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#223249',
    marginBottom: 3,
  },
  cardCompleted: {
    backgroundColor: '#0D2818',
    borderColor: '#15803D',
  },
  cardLocked: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    opacity: 0.65,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  titleArea: {
    flex: 1,
    marginRight: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 7.8,
    fontWeight: 'bold',
  },
  titleCompleted: {
    color: '#86EFAC',
  },
  titleLocked: {
    color: '#6B7280',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 2,
  },
  diffBadge: {
    borderWidth: 0.8,
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  diffText: {
    fontSize: 5.5,
    fontWeight: 'bold',
  },
  description: {
    color: '#94A3B8',
    fontSize: 6.8,
    lineHeight: 8.5,
    marginBottom: 3,
  },
  descriptionLocked: {
    color: '#64748B',
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 0.8,
    borderColor: '#334155',
    gap: 3,
  },
  rewardImage: {
    width: 14,
    height: 14,
  },
  rewardIcon: {
    fontSize: 9,
  },
  rewardName: {
    color: '#FACC15',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  actionBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  actionCompleted: {
    backgroundColor: '#166534',
  },
  actionLocked: {
    backgroundColor: '#374151',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 6.2,
    fontWeight: 'bold',
  },
  actionTextCompleted: {
    color: '#BBF7D0',
  },
  actionTextLocked: {
    color: '#9CA3AF',
  },
});
