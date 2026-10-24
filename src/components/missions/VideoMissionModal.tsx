import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Mission } from '../../types/mission';
import {
  startCameraStream,
  stopMediaStream,
  readFileAsDataUrl,
} from '../../services/mediaService';

interface VideoMissionModalProps {
  mission: Mission;
  onClose: () => void;
  onSuccess: (videoDataUrl?: string) => void;
}

type VideoStep = 'explain' | 'camera' | 'preview';

export const VideoMissionModal: React.FC<VideoMissionModalProps> = ({
  mission,
  onClose,
  onSuccess,
}) => {
  const maxDuration = mission.mediaConfig?.maxDurationSeconds || 30;

  const [step, setStep] = useState<VideoStep>('explain');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    mission.mediaConfig?.facingMode || 'user'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // ignorar
        }
      }
      stopMediaStream(streamRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Erro ao reproduzir stream de vídeo:', err);
      });
    }
  }, [step, stream]);

  const handleClose = () => {
    clearInterval(timerIntervalRef.current);
    stopMediaStream(streamRef.current);
    setStream(null);
    onClose();
  };

  // 1. Abrir Câmera de Vídeo Nativa do Celular (Requisito do Usuário)
  const handleOpenNativeVideoCamera = () => {
    if (typeof document === 'undefined') return;
    setErrorMsg(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.setAttribute('capture', facingMode);

    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          stopMediaStream(streamRef.current);
          setStream(null);
          setRecordedVideoUrl(dataUrl);
          setStep('preview');
        } catch (err) {
          setErrorMsg('Erro ao ler o vídeo gravado.');
        }
      }
    };
    input.click();
  };

  // 2. Abrir Gravador em Tela Cheia no Navegador
  const handleStartCamera = async (targetFacing = facingMode) => {
    setErrorMsg(null);
    setIsLoadingCamera(true);
    try {
      const newStream = await startCameraStream({
        audio: true,
        facingMode: targetFacing,
      });

      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }

      setStream(newStream);
      setStep('camera');
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setErrorMsg('Permissão de câmera/microfone negada. Tente o botão de Câmera Nativa ou Galeria!');
      } else {
        setErrorMsg(err.message || 'Erro ao inicializar câmera e microfone.');
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

  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    setRecordedSeconds(0);

    try {
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options = { mimeType: 'video/webm;codecs=vp9,opus' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stopMediaStream(streamRef.current);
        setStream(null);
        setStep('preview');
      };

      recorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordedSeconds((prev) => {
          if (prev + 1 >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e: any) {
      setErrorMsg('Erro ao iniciar gravação de vídeo.');
    }
  };

  const handleStopRecording = () => {
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignorar
      }
    }
  };

  const handlePickFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          stopMediaStream(streamRef.current);
          setStream(null);
          setRecordedVideoUrl(dataUrl);
          setStep('preview');
        } catch (err) {
          setErrorMsg('Erro ao ler arquivo de vídeo.');
        }
      }
    };
    input.click();
  };

  const handleRetake = () => {
    setRecordedVideoUrl(null);
    setRecordedSeconds(0);
    setStep('explain');
  };

  const handleSubmit = () => {
    onSuccess(recordedVideoUrl || undefined);
  };

  const modalContent = (
    <View style={styles.fullScreenOverlay}>
      {/* 1. TELA DE INSTRUÇÃO E ESCOLHA DE MODO DE CÂMERA */}
      {step === 'explain' && (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.explainCard}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🎥</Text>
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
              {/* OPÇÃO 1: GRAVAR NO APP DE CÂMERA DO CELULAR */}
              <TouchableOpacity
                style={styles.nativeCameraBtn}
                onPress={handleOpenNativeVideoCamera}
                activeOpacity={0.8}
              >
                <Text style={styles.nativeCameraBtnText}>
                  📱 GRAVAR VÍDEO (APP NATIVO)
                </Text>
                <Text style={styles.nativeCameraBtnSub}>
                  Abre a câmera de vídeo original do aparelho
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 2: TELA DA POKÉDEX */}
              <TouchableOpacity
                style={styles.fullScreenCameraBtn}
                onPress={() => handleStartCamera(facingMode)}
                disabled={isLoadingCamera}
                activeOpacity={0.8}
              >
                <Text style={styles.fullScreenCameraBtnText}>
                  {isLoadingCamera ? 'CONECTANDO...' : '🔍 GRAVAR NA POKÉDEX'}
                </Text>
                <Text style={styles.fullScreenCameraBtnSub}>
                  Grava direto pelo visor da tela
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 3: GALERIA */}
              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={handlePickFile}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryBtnText}>📁 ESCOLHER VÍDEO DA GALERIA</Text>
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

      {/* 2. TELA DA CÂMERA NO VISOR */}
      {step === 'camera' && (
        <View style={styles.cameraFullScreenContainer}>
          {/* Topo do Visor com Cronômetro */}
          <View style={styles.cameraTopHUD}>
            <View>
              <Text style={styles.cameraMissionTitle} numberOfLines={1}>
                🎥 {mission.nome}
              </Text>
              <Text style={styles.cameraHUDSub}>
                Tempo: {recordedSeconds}s / {maxDuration}s
              </Text>
            </View>

            <View style={styles.timerBadge}>
              <View
                style={[
                  styles.recordDot,
                  isRecording && styles.recordDotActive,
                ]}
              />
              <Text style={styles.timerText}>
                00:{String(recordedSeconds).padStart(2, '0')}
              </Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.hudCloseBtn}>
              <Text style={styles.hudCloseText}>✕ Sair</Text>
            </TouchableOpacity>
          </View>

          {/* Área Central: Vídeo com guias */}
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

            <View style={styles.viewfinderGuide} pointerEvents="none">
              <View style={styles.reticleTopLeft} />
              <View style={styles.reticleTopRight} />
              <View style={styles.reticleBottomLeft} />
              <View style={styles.reticleBottomRight} />
              <Text style={styles.pokedexWatermark}>REC MODE • POKÉDEX CAM</Text>
            </View>
          </View>

          {/* Barra de Controles Inferior */}
          <View style={styles.cameraBottomHUD}>
            <TouchableOpacity
              style={styles.hudToolBtn}
              onPress={handleSwitchCamera}
              disabled={isRecording}
              activeOpacity={0.7}
            >
              <Text style={styles.hudToolIcon}>🔄</Text>
              <Text style={styles.hudToolLabel}>Inverter</Text>
            </TouchableOpacity>

            {/* Botão de Gravação Principal */}
            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordStartBtn}
                onPress={handleStartRecording}
                activeOpacity={0.7}
              >
                <View style={styles.recordStartInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.recordStopBtn}
                onPress={handleStopRecording}
                activeOpacity={0.7}
              >
                <View style={styles.recordStopInner} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.hudToolBtn}
              onPress={handleOpenNativeVideoCamera}
              disabled={isRecording}
              activeOpacity={0.7}
            >
              <Text style={styles.hudToolIcon}>📱</Text>
              <Text style={styles.hudToolLabel}>Nativo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. TELA DE PRÉ-VISUALIZAÇÃO DO VÍDEO */}
      {step === 'preview' && (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewCard}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>✨</Text>
              <Text style={styles.title} numberOfLines={1}>
                Vídeo Registrado!
              </Text>
            </View>

            <View style={styles.previewFrame}>
              {recordedVideoUrl ? (
                React.createElement('video', {
                  ref: previewVideoRef,
                  src: recordedVideoUrl,
                  controls: true,
                  playsInline: true,
                  autoPlay: true,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  },
                })
              ) : (
                <Text style={styles.emptyVideoText}>Vídeo gravado com sucesso!</Text>
              )}
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
                <Text style={styles.retakeBtnText}>🔄 Gravar Outro Vídeo</Text>
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
    borderColor: '#A855F7',
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
    backgroundColor: '#9333EA',
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  nativeCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
  },
  nativeCameraBtnSub: {
    color: '#E9D5FF',
    fontSize: 5.5,
    marginTop: 1,
    textAlign: 'center',
  },
  fullScreenCameraBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  fullScreenCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
  },
  fullScreenCameraBtnSub: {
    color: '#BAE6FD',
    fontSize: 5.5,
    marginTop: 1,
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

  // Layout Câmera no Visor
  cameraFullScreenContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
  },
  cameraTopHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    zIndex: 10,
  },
  cameraMissionTitle: {
    color: '#F8FAFC',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  cameraHUDSub: {
    color: '#94A3B8',
    fontSize: 6,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 3,
  },
  recordDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6B7280',
  },
  recordDotActive: {
    backgroundColor: '#EF4444',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  hudCloseBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  hudCloseText: {
    color: '#FFFFFF',
    fontSize: 6.5,
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
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
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
    borderColor: '#C084FC',
  },
  reticleTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C084FC',
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#C084FC',
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C084FC',
  },
  pokedexWatermark: {
    position: 'absolute',
    bottom: 3,
    color: 'rgba(192, 132, 252, 0.7)',
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cameraBottomHUD: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    zIndex: 10,
  },
  hudToolBtn: {
    alignItems: 'center',
    minWidth: 40,
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
  recordStartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  recordStartInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
  },
  recordStopBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  recordStopInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },

  // Preview Layout
  previewCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A855F7',
    padding: 5,
  },
  previewFrame: {
    width: '100%',
    height: 75,
    backgroundColor: '#000000',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyVideoText: {
    color: '#94A3B8',
    fontSize: 7,
  },
  rewardNotice: {
    backgroundColor: '#1E293B',
    padding: 3,
    borderRadius: 3,
    marginBottom: 4,
  },
  rewardNoticeText: {
    color: '#CBD5E1',
    fontSize: 6.5,
    textAlign: 'center',
  },
  rewardNoticeHighlight: {
    color: '#FACC15',
    fontWeight: 'bold',
  },
  previewActions: {
    gap: 3,
  },
  submitBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  retakeBtn: {
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#E2E8F0',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
});
