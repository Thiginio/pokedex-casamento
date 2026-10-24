import React, { useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PokedexContainer } from './src/components/PokedexContainer';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // 1. Configurar meta viewport: min 100% (1.0), max 300% (3.0)
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, user-scalable=yes, shrink-to-fit=no, viewport-fit=cover'
      );

      // 2. Trava estrita de pinça no iOS/Safari/Chrome móvel (impede zoom menor que 100% e maior que 300%)
      const handleGestureChange = (e: any) => {
        if (e.scale < 1.0) {
          e.preventDefault();
        } else if (e.scale > 3.0) {
          e.preventDefault();
        }
      };

      document.addEventListener('gesturechange', handleGestureChange, { passive: false });

      return () => {
        document.removeEventListener('gesturechange', handleGestureChange);
      };
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundGrid}>
        {/* Main Interactive Pokédex */}
        <PokedexContainer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E232A',
    width: '100%',
    height: '100%',
  },
  backgroundGrid: {
    flex: 1,
    backgroundColor: '#181B20',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
