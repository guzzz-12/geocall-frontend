import Resizer from "react-image-file-resizer";

const resizeFile = (file: File) => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1800,
      1800,
      "JPEG",
      80,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
};

export const imageResizer = async (file: File) => {
  try {
    const resizedImage = await resizeFile(file) as string;
    return resizedImage;
    
  } catch (error: any) {
    throw new Error(error.message)
  }
};