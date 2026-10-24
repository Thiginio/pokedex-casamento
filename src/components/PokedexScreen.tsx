import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { PokemonViewer, SpriteMode } from './PokemonViewer';
import { MissionsScreen } from './MissionsScreen';

// Assets de Mídia
const openingVideoSource = require('../../assets/gemini_generated_video_e053e0a6.mp4');
const openingAudioSource = require('../../assets/Abertura.mp3');

export type ScreenMode = 'wedding' | 'missions' | 'pokemon';

interface PokedexScreenProps {
  isOpen: boolean;
  screenMode?: ScreenMode;
  onScreenModeChange?: (mode: ScreenMode) => void;
  pokemonId?: number;
  onPokemonIdChange?: (id: number) => void;
  spriteMode?: SpriteMode;
  onSpriteModeChange?: (mode: SpriteMode) => void;
  missionsScrollAction?: { direction: 'up' | 'down'; timestamp: number } | null;
  onAberturaFinished?: () => void;
}

export const PokedexScreen: React.FC<PokedexScreenProps> = ({
  isOpen,
  screenMode: externalMode,
  onScreenModeChange,
  pokemonId,
  onPokemonIdChange,
  spriteMode,
  onSpriteModeChange,
  missionsScrollAction,
  onAberturaFinished,
}) => {
  const [internalMode, setInternalMode] = useState<ScreenMode>('wedding');
  const screenMode = externalMode !== undefined ? externalMode : internalMode;

  const setScreenMode = (mode: ScreenMode) => {
    if (onScreenModeChange) {
      onScreenModeChange(mode);
    } else {
      setInternalMode(mode);
    }
  };

  const [aberturaEnded, setAberturaEnded] = useState<boolean>(false);
  const [currentVideoVolume, setCurrentVideoVolume] = useState<number>(0.3);
  const volumeRampInterval = useRef<any>(null);

  // Player de Vídeo dos Noivos (inicia em loop, áudio ativo)
  const videoPlayer = useVideoPlayer(openingVideoSource, (player) => {
    player.loop = true;
    player.muted = false;
    player.volume = 0.3; // 30% durante a abertura
  });

  // Player de Áudio da Abertura (reproduzido em 100% uma única vez)
  const audioPlayer = useAudioPlayer(openingAudioSource);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  // Função para aumentar suavemente o volume do vídeo para 100% quando a música acabar
  const handleAberturaFinished = () => {
    if (aberturaEnded) return;
    setAberturaEnded(true);
    onAberturaFinished?.();

    try {
      videoPlayer.loop = true;
      if (volumeRampInterval.current) {
        clearInterval(volumeRampInterval.current);
      }

      let vol = 0.3;
      volumeRampInterval.current = setInterval(() => {
        vol += 0.05;
        if (vol >= 1.0) {
          vol = 1.0;
          videoPlayer.volume = 1.0;
          setCurrentVideoVolume(1.0);
          if (volumeRampInterval.current) {
            clearInterval(volumeRampInterval.current);
          }
        } else {
          const rounded = Number(vol.toFixed(2));
          videoPlayer.volume = rounded;
          setCurrentVideoVolume(rounded);
        }
      }, 50);
    } catch (e) {
      console.warn('Erro ao ajustar volume do vídeo:', e);
      videoPlayer.volume = 1.0;
      setCurrentVideoVolume(1.0);
    }
  };

  // Monitora o término do áudio Abertura.mp3 via status do Expo Audio
  useEffect(() => {
    if (isOpen && screenMode === 'wedding' && !aberturaEnded && audioStatus) {
      if (
        audioStatus.didJustFinish ||
        (audioStatus.duration > 0 &&
          audioStatus.currentTime >= audioStatus.duration - 0.3)
      ) {
        handleAberturaFinished();
      }
    }
  }, [audioStatus, isOpen, screenMode, aberturaEnded]);

  // Listener nativo do elemento de áudio web (garantia de precisão no navegador)
  useEffect(() => {
    if (Platform.OS === 'web' && (audioPlayer as any)?.media) {
      const media = (audioPlayer as any).media as HTMLAudioElement;
      const onEnded = () => {
        handleAberturaFinished();
      };
      media.addEventListener('ended', onEnded);
      return () => {
        media.removeEventListener('ended', onEnded);
      };
    }
  }, [audioPlayer, aberturaEnded]);

  // Sequência principal ao abrir/fechar a Pokédex
  useEffect(() => {
    if (isOpen && screenMode === 'wedding') {
      // Reset de estado da abertura
      setAberturaEnded(false);
      setCurrentVideoVolume(0.3);

      if (volumeRampInterval.current) {
        clearInterval(volumeRampInterval.current);
      }

      // 1. Configura e inicia o áudio Abertura.mp3
      try {
        audioPlayer.loop = false;
        audioPlayer.volume = 1.0;
        audioPlayer.seekTo(0);
        audioPlayer.play();
      } catch (e) {
        console.warn('Erro ao iniciar áudio de abertura:', e);
      }

      // 2. Configura e inicia o vídeo com áudio em 30% e em loop
      try {
        videoPlayer.muted = false;
        videoPlayer.volume = 0.3;
        videoPlayer.loop = true;
        videoPlayer.currentTime = 0;
        videoPlayer.play();
      } catch (e) {
        console.warn('Erro ao iniciar vídeo:', e);
      }
    } else {
      // Ao fechar ou mudar de tela, pausa ambos os players
      if (volumeRampInterval.current) {
        clearInterval(volumeRampInterval.current);
      }

      try {
        audioPlayer.pause();
      } catch (e) {
        // silencioso
      }

      try {
        videoPlayer.pause();
      } catch (e) {
        // silencioso
      }
    }
  }, [isOpen, screenMode]);

  const toggleMode = () => {
    setScreenMode(screenMode === 'wedding' ? 'pokemon' : 'wedding');
  };

  return (
    <View style={styles.screenRoot}>
      {screenMode === 'wedding' ? (
        <View style={styles.fullScreen}>
          <VideoView
            style={styles.videoView}
            player={videoPlayer}
            contentFit="cover"
            nativeControls={false}
          />
        </View>
      ) : screenMode === 'missions' ? (
        <MissionsScreen
          onBack={() => setScreenMode('wedding')}
          scrollAction={missionsScrollAction}
          onViewInPokedex={(rewardPokemonId) => {
            onPokemonIdChange?.(rewardPokemonId);
            setScreenMode('pokemon');
          }}
        />
      ) : (
        <PokemonViewer
          currentPokemonId={pokemonId}
          onPokemonChange={onPokemonIdChange}
          spriteMode={spriteMode}
          onSpriteModeChange={onSpriteModeChange}
          initialPokemonId={192}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  fullScreen: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  modeSwitchBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 99,
  },
  modeSwitchText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
