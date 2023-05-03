import browserImageCompression from "browser-image-compression";

/**
 * Convertir la imagen a base64
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result?.toString() || "")
    };

    fileReader.onerror = (err) => reject(err)
  })
};


/**
 * Comprimir una imagen a jpeg base64 de máximo
 * 3 MB o 2400px en su dimensión mayor
 */
export const imageProcessor = async (file: File, type: "file" | "base64"): Promise<File | string> => {
  try {
    const compressedImage = await browserImageCompression(file, {
      fileType: "image/jpeg",
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2400,
      initialQuality: 0.75,
      useWebWorker: true
    });

    if (type === "base64") {
      const imageBase64 = await fileToBase64(compressedImage);
      return imageBase64;
    };

    return compressedImage;
    
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};