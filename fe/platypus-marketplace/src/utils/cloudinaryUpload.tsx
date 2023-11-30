import axios from "axios";

export const cloudinaryUpload = async (imageFile: File) => {
  const formDataImage = new FormData();
  formDataImage.append("file", imageFile);
  formDataImage.append("upload_preset", `${process.env.CLOUDINARY_TOKEN}`);

  try {
    const response = await axios.post(
      `${process.env.CLOUDINARY_UPLOAD}`,
      formDataImage,
    );
    return response.data.url;
  } catch (error) {
    throw error;
  }
};
