import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Mission,
  MissionCategory,
  MissionReward,
} from '../types/mission';
import { Guest } from '../types/guest';
import {
  getOrCreateGuest,
  completeMissionForGuest,
} from '../services/guestService';
import {
  getMissionsForGuest,
  MISSION_CATEGORIES,
} from '../services/missionService';
import { CategoryTabBar, MissionScreenTab } from './missions/CategoryTabBar';
import { CapturedPokemonsTab } from './missions/CapturedPokemonsTab';
import { MissionCard } from './missions/MissionCard';
import { PhotoMissionModal } from './missions/PhotoMissionModal';
import { VideoMissionModal } from './missions/VideoMissionModal';
import { CoupleCodeModal } from './missions/CoupleCodeModal';
import { MinigameModal } from './missions/MinigameModal';
import { RewardModal } from './missions/RewardModal';

interface MissionsScreenProps {
  onBack?: () => void;
  scrollAction?: { direction: 'up' | 'down'; timestamp: number } | null;
  onViewInPokedex?: (pokemonId: number) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  onBack,
  scrollAction,
  onViewInPokedex,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollPos, setScrollPos] = useState(0);

  // Perfil do convidado atual e catálogo de missões
  const [guest, setGuest] = useState<Guest>(() => getOrCreateGuest());
  const [activeCategory, setActiveCategory] = useState<MissionScreenTab>('FOTO');

  // Controle de modais
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [rewardCelebration, setRewardCelebration] = useState<{
    reward: MissionReward;
    title: string;
    rewardsList?: any[];
    isShiny?: boolean;
  } | null>(null);

  // Lista de missões atualizadas de acordo com o progresso do convidado
  const missions = useMemo(() => {
    return getMissionsForGuest(guest);
  }, [guest]);

  // Contadores e estatísticas
  const totalCompleted = Object.keys(guest.completedMissions).length;
  const totalMissions = missions.length;

  const categoryStats = useMemo(() => {
    const stats: Record<MissionCategory, { total: number; completed: number }> = {
      FOTO: { total: 0, completed: 0 },
      VIDEO: { total: 0, completed: 0 },
      NOIVOS: { total: 0, completed: 0 },
      MINIJOGO: { total: 0, completed: 0 },
    };

    missions.forEach((m) => {
      if (stats[m.categoria]) {
        stats[m.categoria].total += 1;
        if (m.status === 'CONCLUIDA') {
          stats[m.categoria].completed += 1;
        }
      }
    });

    return stats;
  }, [missions]);

  // Missões filtradas pela categoria selecionada
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => m.categoria === activeCategory);
  }, [missions, activeCategory]);

  // Sincronização de rolagem com o D-Pad físico da Pokédex
  useEffect(() => {
    if (!scrollAction) return;
    setScrollPos((prev) => {
      const nextPos =
        scrollAction.direction === 'down'
          ? Math.min(prev + 45, 300)
          : Math.max(0, prev - 45);
      scrollRef.current?.scrollTo({ y: nextPos, animated: true });
      return nextPos;
    });
  }, [scrollAction]);

  // Conclusão com sucesso de qualquer tipo de missão
  const handleCompleteMission = (
    mission: Mission,
    proofType: 'FOTO' | 'VIDEO' | 'CODIGO' | 'MINIJOGO',
    proofData?: string
  ) => {
    try {
      const { updatedGuest, rewards, isShiny } = completeMissionForGuest(
        guest,
        mission,
        proofType,
        proofData
      );

      setGuest(updatedGuest);
      setActiveMission(null);

      // Exibe celebração do Pokémon resgatado
      setRewardCelebration({
        reward: mission.recompensa,
        title: mission.nome,
        rewardsList: rewards,
        isShiny,
      });
    } catch (e: any) {
      console.warn('Erro ao concluir missão:', e.message);
      setActiveMission(null);
    }
  };

  const handleSelectMission = (mission: Mission) => {
    if (mission.status === 'BLOQUEADA') return;
    setActiveMission(mission);
  };

  const progressPercent = Math.round((totalCompleted / totalMissions) * 100);

  return (
    <View style={styles.container}>
      {/* 1. CABEÇALHO DA POKÉDEX */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>◀</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          📋 Missões dos Noivos
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalCompleted}/{totalMissions} ({progressPercent}%)
          </Text>
        </View>
      </View>

      {/* 2. BARRA DE PROGRESSO SLIM */}
      <View style={styles.progressBarTrack}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>

      {/* 3. ABAS MODULARES DE CATEGORIA + ABA MEUS POKÉMON */}
      <CategoryTabBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryStats={categoryStats}
        totalCaptured={totalCompleted}
      />

      {/* 4. CONTEÚDO: ABA DE POKÉMONS CAPTURADOS OU LISTA DE MISSÕES */}
      {activeCategory === 'COLECAO' ? (
        <CapturedPokemonsTab
          guest={guest}
          onViewInPokedex={(pokemonId) => onViewInPokedex?.(pokemonId)}
          onGoToMission={(missionId) => {
            const target = missions.find((m) => m.id === missionId);
            if (target) {
              setActiveCategory(target.categoria);
              setActiveMission(target);
            }
          }}
        />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onPress={() => handleSelectMission(mission)}
            />
          ))}
        </ScrollView>
      )}

      {/* 5. RODAPÉ INFORMATIVO */}
      <View style={styles.footer}>
        <Text style={styles.footerText} numberOfLines={1}>
          {activeCategory === 'COLECAO'
            ? `🎒 ${totalCompleted}/23 Pokémon capturados no Casamento`
            : totalCompleted === totalMissions
            ? '🏆 Você capturou todos os Pokémon do Casamento!'
            : 'Toque em uma missão para cumprir e capturar!'}
        </Text>
      </View>

      {/* --- MODAIS DE EXECUÇÃO DE MISSÕES --- */}
      {activeMission && activeMission.tipoValidacao === 'UPLOAD_FOTO' && (
        <PhotoMissionModal
          mission={activeMission}
          onClose={() => setActiveMission(null)}
          onSuccess={(photoDataUrl) =>
            handleCompleteMission(activeMission, 'FOTO', photoDataUrl)
          }
        />
      )}

      {activeMission && activeMission.tipoValidacao === 'UPLOAD_VIDEO' && (
        <VideoMissionModal
          mission={activeMission}
          onClose={() => setActiveMission(null)}
          onSuccess={(videoDataUrl) =>
            handleCompleteMission(activeMission, 'VIDEO', videoDataUrl)
          }
        />
      )}

      {activeMission && activeMission.tipoValidacao === 'CODIGO_NOIVOS' && (
        <CoupleCodeModal
          mission={activeMission}
          onClose={() => setActiveMission(null)}
          onSuccess={(code) =>
            handleCompleteMission(activeMission, 'CODIGO', code)
          }
        />
      )}

      {activeMission && activeMission.tipoValidacao === 'MINIJOGO_SCORE' && (
        <MinigameModal
          mission={activeMission}
          onClose={() => setActiveMission(null)}
          onSuccess={(score) =>
            handleCompleteMission(activeMission, 'MINIJOGO', String(score))
          }
        />
      )}

      {/* CELEBRAÇÃO / RESGATE DE RECOMPENSA */}
      {rewardCelebration && (
        <RewardModal
          reward={rewardCelebration.reward}
          missionTitle={rewardCelebration.title}
          rewardsList={rewardCelebration.rewardsList}
          isShiny={rewardCelebration.isShiny}
          onClose={() => setRewardCelebration(null)}
          onViewInPokedex={(pokemonId) => {
            setRewardCelebration(null);
            onViewInPokedex?.(pokemonId);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F141C',
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'space-between',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 1,
  },
  backBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginRight: 3,
  },
  backText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#166534',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    color: '#BBF7D0',
    fontSize: 7,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 2,
    width: '100%',
    backgroundColor: '#1E293B',
    marginVertical: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
  },
  scrollList: {
    flex: 1,
    marginVertical: 2,
  },
  scrollContent: {
    paddingBottom: 2,
  },
  footer: {
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 1,
  },
  footerText: {
    color: '#64748B',
    fontSize: 6.2,
  },
});
