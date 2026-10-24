import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Mission } from '../../types/mission';
import {
  startCameraStream,
  stopMediaStream,
  captureFrameFromVideo,
  readFileAsDataUrl,
} from '../../services/mediaService';

interface PhotoMissionModalProps {
  mission: Mission;
  onClose: () => void;
  onSuccess: (photoDataUrl: string) => void;
}

type PhotoStep = 'explain' | 'camera' | 'preview';

export const PhotoMissionModal: React.FC<PhotoMissionModalProps> = ({
  mission,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<PhotoStep>('explain');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    mission.mediaConfig?.facingMode || 'environment'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // Limpeza de stream ao desmontar
  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
    };
  }, []);

  // Quando o stream estiver pronto, atribui ao elemento video
  useEffect(() => {
    if (step === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Erro ao reproduzir stream de vídeo:', err);
      });
    }
  }, [step, stream]);

  const handleClose = () => {
    stopMediaStream(streamRef.current);
    setStream(null);
    onClose();
  };

  // 1. Abrir App de Câmera Nativa do Celular (Requisito do Usuário)
  const handleOpenNativeCamera = (targetFacing = facingMode) => {
    if (typeof document === 'undefined') return;
    setErrorMsg(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', targetFacing);

    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          stopMediaStream(streamRef.current);
          setStream(null);
          setCapturedPhoto(dataUrl);
          setStep('preview');
        } catch (err) {
          setErrorMsg('Erro ao ler a foto da câmera.');
        }
      }
    };
    input.click();
  };

  // 2. Abrir Câmera em Tela Cheia no Navegador (Requisito do Usuário)
  const handleStartCamera = async (targetFacing = facingMode) => {
    setErrorMsg(null);
    setIsLoadingCamera(true);
    try {
      const newStream = await startCameraStream({
        audio: false,
        facingMode: targetFacing,
      });

      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }

      setStream(newStream);
      setStep('camera');
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setErrorMsg('Permissão de câmera negada. Tente o botão do App Nativo ou Escolha da Galeria!');
      } else {
        setErrorMsg(err.message || 'Não foi possível acessar a câmera.');
      }
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const handleSwitchCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    handleStartCamera(nextFacing);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const dataUrl = captureFrameFromVideo(videoRef.current);
      stopMediaStream(streamRef.current);
      setStream(null);
      setCapturedPhoto(dataUrl);
      setStep('preview');
    } catch (e: any) {
      setErrorMsg('Falha ao capturar foto. Tente novamente.');
    }
  };

  const handlePickFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          stopMediaStream(streamRef.current);
          setStream(null);
          setCapturedPhoto(dataUrl);
          setStep('preview');
        } catch (err) {
          setErrorMsg('Erro ao ler a imagem selecionada.');
        }
      }
    };
    input.click();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setStep('explain');
  };

  const handleSubmit = () => {
    if (capturedPhoto) {
      onSuccess(capturedPhoto);
    }
  };

  // Conteúdo do Modal renderizado DENTRO da tela da Pokédex (Passo 7: sem popup externo)
  const modalContent = (
    <View style={styles.fullScreenOverlay}>
      {/* 1. ETAPA DE EXPLICAÇÃO / ESCOLHA DO MODO DE CÂMERA */}
      {step === 'explain' && (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.explainCard}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>📸</Text>
              <Text style={styles.title} numberOfLines={1}>
                {mission.nome}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.missionDesc}>{mission.descricao}</Text>

            <View style={styles.recompensaCard}>
              <Text style={styles.recompensaTitle}>Recompensa ao completar:</Text>
              <Text style={styles.recompensaName}>
                ⚡ {mission.recompensa.pokemonName} (Nº {mission.recompensa.pokemonId})
              </Text>
            </View>

            {errorMsg && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            <View style={styles.actionsColumn}>
              {/* OPÇÃO 1: ABRIR O APP DE CÂMERA DO CELULAR */}
              <TouchableOpacity
                style={styles.nativeCameraBtn}
                onPress={() => handleOpenNativeCamera('environment')}
                activeOpacity={0.8}
              >
                <Text style={styles.nativeCameraBtnText}>
                  📱 ABRIR CÂMERA (APP NATIVO)
                </Text>
                <Text style={styles.nativeCameraBtnSub}>
                  Tira a foto usando a câmera do seu aparelho
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 2: VISOR NA POKÉDEX */}
              <TouchableOpacity
                style={styles.fullScreenCameraBtn}
                onPress={() => handleStartCamera('environment')}
                disabled={isLoadingCamera}
                activeOpacity={0.8}
              >
                <Text style={styles.fullScreenCameraBtnText}>
                  {isLoadingCamera ? 'INICIALIZANDO...' : '🔍 ABRIR VISOR NA POKÉDEX'}
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 3: GALERIA */}
              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={handlePickFile}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryBtnText}>📁 ESCOLHER DA GALERIA</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* 2. ETAPA DE CÂMERA NO VISOR DA POKÉDEX */}
      {step === 'camera' && (
        <View style={styles.cameraFullScreenContainer}>
          {/* Topo do Visor */}
          <View style={styles.cameraTopHUD}>
            <View>
              <Text style={styles.cameraMissionTitle} numberOfLines={1}>
                📸 {mission.nome}
              </Text>
              <Text style={styles.cameraHUDSub}>
                Enquadre o momento do casamento
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.hudCloseBtn}>
              <Text style={styles.hudCloseText}>✕ Sair</Text>
            </TouchableOpacity>
          </View>

          {/* Área Central: Vídeo com guias Pokédex */}
          <View style={styles.videoStreamContainer}>
            {React.createElement('video', {
              ref: videoRef,
              autoPlay: true,
              playsInline: true,
              muted: true,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              },
            })}

            {/* Retículo Pokédex */}
            <View style={styles.viewfinderGuide} pointerEvents="none">
              <View style={styles.reticleTopLeft} />
              <View style={styles.reticleTopRight} />
              <View style={styles.reticleBottomLeft} />
              <View style={styles.reticleBottomRight} />
              <View style={styles.centerTarget} />
              <Text style={styles.pokedexWatermark}>POKÉDEX VISION</Text>
            </View>
          </View>

          {/* Barra de Controles Inferior */}
          <View style={styles.cameraBottomHUD}>
            <TouchableOpacity
              style={styles.hudToolBtn}
              onPress={handleSwitchCamera}
              activeOpacity={0.7}
            >
              <Text style={styles.hudToolIcon}>🔄</Text>
              <Text style={styles.hudToolLabel}>
                {facingMode === 'user' ? 'Traseira' : 'Frontal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shutterBigBtn}
              onPress={handleCapture}
              activeOpacity={0.7}
            >
              <View style={styles.shutterBigInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hudToolBtn}
              onPress={() => handleOpenNativeCamera(facingMode)}
              activeOpacity={0.7}
            >
              <Text style={styles.hudToolIcon}>📱</Text>
              <Text style={styles.hudToolLabel}>App Nativo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. ETAPA DE PRÉ-VISUALIZAÇÃO DA FOTO */}
      {step === 'preview' && capturedPhoto && (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewCard}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>✨</Text>
              <Text style={styles.title} numberOfLines={1}>
                Foto Pronta para Envio!
              </Text>
            </View>

            <View style={styles.previewFrame}>
              <Image
                source={{ uri: capturedPhoto }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.rewardNotice}>
              <Text style={styles.rewardNoticeText}>
                🎁 Ao enviar, você desbloqueará{' '}
                <Text style={styles.rewardNoticeHighlight}>
                  {mission.recompensa.pokemonName}
                </Text>{' '}
                na sua Pokédex!
              </Text>
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>✅ CONFIRMAR E RESGATAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <Text style={styles.retakeBtnText}>🔄 Tirar Outra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );

  return modalContent;
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(5, 10, 20, 0.98)',
    zIndex: 100,
    padding: 3,
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 6,
  },
  explainCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 3,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  title: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 8,
    fontWeight: '900',
  },
  closeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#1E293B',
    borderRadius: 3,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  missionDesc: {
    color: '#E2E8F0',
    fontSize: 6.8,
    lineHeight: 9,
    marginBottom: 3,
  },
  recompensaCard: {
    backgroundColor: '#1E293B',
    padding: 3,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#FACC15',
    marginBottom: 4,
  },
  recompensaTitle: {
    color: '#94A3B8',
    fontSize: 6,
  },
  recompensaName: {
    color: '#FACC15',
    fontSize: 7.2,
    fontWeight: 'bold',
    marginTop: 1,
  },
  errorCard: {
    backgroundColor: '#7F1D1D',
    padding: 3,
    borderRadius: 3,
    marginBottom: 3,
  },
  errorText: {
    color: '#FECACA',
    fontSize: 6.2,
  },
  actionsColumn: {
    gap: 3,
  },
  nativeCameraBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  nativeCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
  },
  nativeCameraBtnSub: {
    color: '#BAE6FD',
    fontSize: 5.5,
    marginTop: 1,
    textAlign: 'center',
  },
  fullScreenCameraBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  fullScreenCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
  },
  galleryBtn: {
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  galleryBtnText: {
    color: '#F1F5F9',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 6.5,
  },
  // Camera HUD in-pokedex
  cameraFullScreenContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
  },
  cameraTopHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    zIndex: 10,
  },
  cameraMissionTitle: {
    color: '#F8FAFC',
    fontSize: 7.2,
    fontWeight: 'bold',
  },
  cameraHUDSub: {
    color: '#94A3B8',
    fontSize: 5.8,
  },
  hudCloseBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  hudCloseText: {
    color: '#FFFFFF',
    fontSize: 6.2,
    fontWeight: 'bold',
  },
  videoStreamContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  viewfinderGuide: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#38BDF8',
  },
  reticleTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#38BDF8',
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#38BDF8',
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#38BDF8',
  },
  centerTarget: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  pokedexWatermark: {
    position: 'absolute',
    bottom: 2,
    color: 'rgba(56, 189, 248, 0.7)',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cameraBottomHUD: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    zIndex: 10,
  },
  hudToolBtn: {
    alignItems: 'center',
  },
  hudToolIcon: {
    fontSize: 10,
  },
  hudToolLabel: {
    color: '#CBD5E1',
    fontSize: 5.5,
    fontWeight: '600',
    marginTop: 1,
  },
  shutterBigBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  shutterBigInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  // Preview Layout
  previewCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
    padding: 5,
  },
  previewFrame: {
    width: '100%',
    height: 65,
    backgroundColor: '#000000',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  rewardNotice: {
    backgroundColor: '#1E293B',
    padding: 3,
    borderRadius: 3,
    marginBottom: 4,
  },
  rewardNoticeText: {
    color: '#CBD5E1',
    fontSize: 6,
    textAlign: 'center',
  },
  rewardNoticeHighlight: {
    color: '#FACC15',
    fontWeight: 'bold',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 4,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: 3,
    paddingVertical: 3.5,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 6.8,
    fontWeight: '900',
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 3,
    paddingVertical: 3.5,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#E2E8F0',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
});
