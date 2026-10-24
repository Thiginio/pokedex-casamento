/**
 * Serviço de Gerenciamento de Câmera, Microfone e Mídia do Navegador
 * Segue estritamente as diretrizes de privacidade e ciclo de vida de streams
 */

export interface CameraStreamOptions {
  audio?: boolean;
  facingMode?: 'user' | 'environment';
}

/**
 * Solicita acesso à câmera (e microfone apenas se requisitado)
 * NUNCA solicita áudio para fotografia
 */
export async function startCameraStream(
  options: CameraStreamOptions = {}
): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      'Seu navegador ou dispositivo não possui suporte para acesso direto à câmera.'
    );
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: options.facingMode || 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: options.audio === true, // Somente se explicitamente true (vídeos)
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('PERMISSION_DENIED');
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('DEVICE_NOT_FOUND');
    }
    throw new Error(error.message || 'Erro ao acessar a câmera.');
  }
}

/**
 * Encerra rigorosamente todos os tracks de áudio e vídeo de um stream
 */
export function stopMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (e) {
    console.warn('Erro ao encerrar tracks do stream:', e);
  }
}

/**
 * Captura um frame estático de um elemento <video> para Data URL (Base64 JPEG)
 */
export function captureFrameFromVideo(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter contexto do canvas.');

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Converte arquivo de input em Data URL para pré-visualização
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
