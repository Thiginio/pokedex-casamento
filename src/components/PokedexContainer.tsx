import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { PokedexClosed } from './PokedexClosed';
import { PokedexOpen } from './PokedexOpen';
import { PokedexFlap } from './PokedexFlap';
import { PokedexScreen, ScreenMode } from './PokedexScreen';
import { SpriteMode } from './PokemonViewer';
import { AUTHORIZED_POKEMON_SPECIES_LIST } from '../services/missionService';

interface PokedexContainerProps {
  onStateChange?: (isOpen: boolean) => void;
}

// Native base proportions matching the reference images
const POKEDEX_WIDTH = 340;
const POKEDEX_HEIGHT = 560;

export const PokedexContainer: React.FC<PokedexContainerProps> = ({
  onStateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>('wedding');
  const [canShowMissions, setCanShowMissions] = useState<boolean>(false);
  const [pokemonId, setPokemonId] = useState<number>(192);
  const [spriteMode, setSpriteMode] = useState<SpriteMode>('artwork');
  const [missionsScrollAction, setMissionsScrollAction] = useState<{
    direction: 'up' | 'down';
    timestamp: number;
  } | null>(null);
  const openAnim = useRef(new Animated.Value(0)).current;
  const currentOpenValue = useRef(0);

  // Botão Central Verde: Navega sequencialmente entre os módulos (Noivos -> Pokédex -> Missões)
  const handlePressGreenButton = () => {
    setScreenMode((prev) => {
      if (prev === 'wedding') return 'pokemon';
      if (prev === 'pokemon') return 'missions';
      return 'wedding';
    });
  };

  const greenButtonLabel =
    screenMode === 'wedding'
      ? '⚡ POKÉDEX'
      : screenMode === 'pokemon'
      ? '📋 MISSÕES'
      : '💍 NOIVOS';

  // Pílulas vermelha e ciano (Print 4): Alterna entre visualizações Pokémon (Arte, GIF, Shiny, Pixel)
  const SPRITE_MODES: SpriteMode[] = [
    'artwork',
    'showdown',
    'artworkShiny',
    'pixel',
  ];
  const handleCycleSprite = (direction: 'next' | 'prev' = 'next') => {
    if (screenMode !== 'pokemon') {
      setScreenMode('pokemon');
    }
    setSpriteMode((current) => {
      const idx = SPRITE_MODES.indexOf(current);
      if (direction === 'next') {
        return SPRITE_MODES[(idx + 1) % SPRITE_MODES.length];
      } else {
        return SPRITE_MODES[(idx - 1 + SPRITE_MODES.length) % SPRITE_MODES.length];
      }
    });
  };

  // D-Pad: Navega estritamente entre os 23 Pokémon autorizados do casamento
  const authorizedIds = AUTHORIZED_POKEMON_SPECIES_LIST.map((s) => s.id);
  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (screenMode === 'pokemon') {
      setPokemonId((currentId) => {
        const idx = authorizedIds.indexOf(currentId);
        if (idx === -1) return authorizedIds[0];
        if (direction === 'up' || direction === 'right') {
          return authorizedIds[(idx + 1) % authorizedIds.length];
        } else {
          return authorizedIds[(idx - 1 + authorizedIds.length) % authorizedIds.length];
        }
      });
    } else if (screenMode === 'missions') {
      setMissionsScrollAction({
        direction: direction === 'down' || direction === 'right' ? 'down' : 'up',
        timestamp: Date.now(),
      });
    } else {
      // Noivos: se pressionar para cima/direita, entra na Pokédex
      if (direction === 'up' || direction === 'right') {
        setScreenMode('pokemon');
      }
    }
  };

  // Track animation progress
  React.useEffect(() => {
    const id = openAnim.addListener(({ value }) => {
      currentOpenValue.current = value;
    });
    return () => openAnim.removeListener(id);
  }, [openAnim]);

  // Smooth spring open/close functions
  const openPokedex = () => {
    setIsOpen(true);
    Animated.spring(openAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onStateChange?.(true);
    });
  };

  const closePokedex = () => {
    Animated.spring(openAnim, {
      toValue: 0,
      tension: 45,
      friction: 8,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsOpen(false);
      setCanShowMissions(false);
      setScreenMode('wedding');
      onStateChange?.(false);
    });
  };

  const togglePokedex = () => {
    if (currentOpenValue.current > 0.5) {
      closePokedex();
    } else {
      openPokedex();
    }
  };

  // PanResponder for natural swipe gesture when closed ("ao passar o dedo")
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => currentOpenValue.current < 0.5,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (currentOpenValue.current > 0.5) return false;
        return Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.vx) > 0.1;
      },
      onPanResponderGrant: () => {
        openAnim.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const dragDistance = 240;
        let nextVal = 0;
        if (currentOpenValue.current < 0.5) {
          // Closed: dragging to the right (positive dx) opens
          nextVal = Math.max(0, Math.min(gestureState.dx / dragDistance, 1));
        }
        openAnim.setValue(nextVal);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Se a Pokédex está aberta, ela fecha EXCLUSIVAMENTE pelo botão preto (Passo 1 e 4)
        if (currentOpenValue.current > 0.5) {
          return;
        }

        // Se a Pokédex está fechada: toque rápido ou swipe para a direita abre
        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          openPokedex();
          return;
        }

        // Swiping threshold and velocity check
        if (gestureState.dx > 60 || gestureState.vx > 0.4) {
          openPokedex();
        } else {
          closePokedex();
        }
      },
    })
  ).current;

  // Dimensões reativas da janela do navegador ou dispositivo
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Detecção de smartphone (largura <= 540 ou navegador móvel)
  const isMobileScreen = windowWidth <= 540;
  const isMobileDevice =
    Platform.OS !== 'web' ||
    (typeof navigator !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ));
  const isSmartphone = isMobileScreen || isMobileDevice;

  // No smartphone via navegador, a Pokédex ocupa 100% da largura da tela do celular
  let scale = 1;
  if (isSmartphone && windowWidth > 0) {
    const fullWidthScale = windowWidth / POKEDEX_WIDTH;
    if (windowHeight > 0 && windowWidth > windowHeight) {
      // Modo paisagem em celular: ajusta para caber na altura
      const heightScale = (windowHeight * 0.95) / POKEDEX_HEIGHT;
      scale = Math.min(fullWidthScale, heightScale);
    } else {
      // Modo retrato em smartphone: 100% da largura da tela
      scale = fullWidthScale;
    }
  } else {
    // Desktop e Tablets: console elegante centralizado
    const availableWidth = windowWidth > 0 ? windowWidth : 400;
    const availableHeight = windowHeight > 0 ? windowHeight : 700;
    const horizontalScale = (availableWidth * 0.88) / POKEDEX_WIDTH;
    const verticalScale = (availableHeight * 0.78) / POKEDEX_HEIGHT;
    scale = Math.min(horizontalScale, verticalScale, 1.25);
  }

  // 3D Flap Rotation calculations
  // Pivot offset is 145px right from center (340/2 = 170; 315 - 170 = 145)
  const HINGE_X_OFFSET = 145;

  // Front face rotation from 0deg (closed) to 180deg (fully opened to the right)
  const flapRotateY = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '175deg'],
  });

  // Flap opacity / shadow intensity
  const flapElevation = openAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [10, 25, 0],
  });

  // Clasp pulse / hint opacity (visible when closed, fades out when opening)
  const hintOpacity = openAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [1, 0, 0],
  });

  // Interior reveal opacity
  const interiorOpacity = openAnim.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <ScrollView
      style={styles.mainScrollView}
      contentContainerStyle={[
        styles.outerWrapper,
        isSmartphone && styles.outerWrapperMobile,
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Pokédex Display Area - ocupa 100% da largura no smartphone */}
      <View
        style={{
          width: isSmartphone ? windowWidth : POKEDEX_WIDTH * scale,
          height: POKEDEX_HEIGHT * scale,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={[
            styles.scalingContainer,
            {
              width: POKEDEX_WIDTH,
              height: POKEDEX_HEIGHT,
              transform: [{ scale }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Layer 1: Inside Pokédex (Base revealed when flap opens) */}
          <Animated.View
            style={[
              styles.layerAbsolute,
              {
                opacity: interiorOpacity,
              },
            ]}
            pointerEvents={isOpen ? 'auto' : 'none'}
          >
            <PokedexOpen
              width={POKEDEX_WIDTH}
              height={POKEDEX_HEIGHT}
              screenContent={
                <PokedexScreen
                  isOpen={isOpen}
                  screenMode={screenMode}
                  onScreenModeChange={setScreenMode}
                  pokemonId={pokemonId}
                  onPokemonIdChange={setPokemonId}
                  spriteMode={spriteMode}
                  onSpriteModeChange={setSpriteMode}
                  missionsScrollAction={missionsScrollAction}
                  onAberturaFinished={() => setCanShowMissions(true)}
                />
              }
              showMissionsPrompt={canShowMissions && screenMode !== 'missions'}
              onPressGreenPad={handlePressGreenButton}
              greenButtonLabel={greenButtonLabel}
              onPressClose={closePokedex}
              onPressSpriteButton={handleCycleSprite}
              onPressDpad={handleDpad}
            />
          </Animated.View>

          {/* Layer 2: 3D Animated Flap Cover (Closed state from Pokedex completa.png) */}
          <Animated.View
            style={[
              styles.layerAbsolute,
              {
                zIndex: 10,
                transform: [
                  { perspective: 1200 },
                  { translateX: HINGE_X_OFFSET },
                  { rotateY: flapRotateY },
                  { translateX: -HINGE_X_OFFSET },
                ],
              },
            ]}
          >
            <PokedexClosed width={POKEDEX_WIDTH} height={POKEDEX_HEIGHT} />
          </Animated.View>
        </View>
      </View>

      {/* Interactive Helper Cue / Controls with refined spacing and compact sizing */}
      <View style={styles.controlsArea}>
        <Animated.View style={{ opacity: hintOpacity }}>
          <View style={styles.hintBadge}>
            <Text style={styles.hintIcon}>👉</Text>
            <Text style={styles.hintText}>Passe o dedo para abrir</Text>
          </View>
        </Animated.View>

        {/* Manual Toggle Button - compact and elegantly positioned */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionButton}
          onPress={togglePokedex}
        >
          <Text style={styles.actionButtonText}>
            {isOpen ? 'Fechar Pokédex 📕' : 'Abrir Pokédex 📖'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainScrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  outerWrapper: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  outerWrapperMobile: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
  },
  scalingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  layerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: POKEDEX_WIDTH,
    height: POKEDEX_HEIGHT,
    backfaceVisibility: 'hidden',
  },
  controlsArea: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  controlsAreaMobile: {
    marginTop: 8,
    marginBottom: 12,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hintIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.2,
  },
  actionButton: {
    backgroundColor: '#DC0A2D',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
