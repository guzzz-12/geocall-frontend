import Resizer from "react-image-file-resizer";

const resizeFile = (file: File, type: "file" | "base64") => {
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
      type
    );
  });
};

export const imageResizer = async (file: File, type: "file" | "base64") => {
  try {
    const resizedImage = await resizeFile(file, type) as File | string;
    return resizedImage;
    
  } catch (error: any) {
    throw new Error(error.message)
  }
};