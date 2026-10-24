import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MissionCategory, MissionCategoryInfo } from '../../types/mission';
import { MISSION_CATEGORIES } from '../../services/missionService';

export type MissionScreenTab = MissionCategory | 'COLECAO';

interface CategoryTabBarProps {
  activeCategory: MissionScreenTab;
  onSelectCategory: (category: MissionScreenTab) => void;
  categoryStats: Record<MissionCategory, { total: number; completed: number }>;
  totalCaptured?: number;
}

export const CategoryTabBar: React.FC<CategoryTabBarProps> = ({
  activeCategory,
  onSelectCategory,
  categoryStats,
  totalCaptured = 0,
}) => {
  const isColecaoActive = activeCategory === 'COLECAO';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Abas das 4 Categorias de Missões */}
        {MISSION_CATEGORIES.map((cat: MissionCategoryInfo) => {
          const isActive = activeCategory === cat.key;
          const stats = categoryStats[cat.key] || { total: 0, completed: 0 };
          const allCompleted = stats.total > 0 && stats.completed === stats.total;

          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: `${cat.color}25`,
                  borderColor: cat.color,
                },
              ]}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { color: cat.color, fontWeight: '900' },
                ]}
              >
                {cat.label}
              </Text>
              <View
                style={[
                  styles.badge,
                  allCompleted && styles.badgeAllDone,
                  isActive && { backgroundColor: cat.color },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isActive && styles.badgeTextActive,
                  ]}
                >
                  {stats.completed}/{stats.total}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 2. Aba Especial dos Pokémon Visualizados / Capturados */}
        <TouchableOpacity
          key="COLECAO"
          style={[
            styles.tab,
            styles.tabColecao,
            isColecaoActive && {
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderColor: '#10B981',
            },
          ]}
          onPress={() => onSelectCategory('COLECAO')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>🏆</Text>
          <Text
            style={[
              styles.tabLabel,
              isColecaoActive && { color: '#10B981', fontWeight: '900' },
            ]}
          >
            Meus Pokémon
          </Text>
          <View
            style={[
              styles.badge,
              totalCaptured > 0 && styles.badgeAllDone,
              isColecaoActive && { backgroundColor: '#10B981' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isColecaoActive && styles.badgeTextActive,
              ]}
            >
              {totalCaptured}/23
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0A0F18',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 3,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#161F2E',
    borderWidth: 1,
    borderColor: '#223249',
    gap: 3,
  },
  tabColecao: {
    borderColor: '#059669',
  },
  tabIcon: {
    fontSize: 8.5,
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 7,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  badgeAllDone: {
    backgroundColor: '#16A34A',
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: 6,
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: '#0F172A',
  },
});
