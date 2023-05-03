/**
 * Obtener el stream local del usuario
 */
export const getLocalStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    return stream;
  } catch (error: any) {
    throw error;
  }
};