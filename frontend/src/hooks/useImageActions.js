import {
  likeImageRequest,
  addFavoriteRequest,
  downloadImageRequest,
} from "../services/imageService";
export default function useImageActions({
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  notifySuccess,
  notifyError,
}) {

  const likeImage = async (id) => {
     
  try {
    const res = await likeImageRequest(id);

    const updatedImage = res.data;

    setImages((prevImages) =>
      prevImages.map((img) =>
        Number(img.id) === Number(updatedImage.id)
          ? {
              ...img,
              likes: updatedImage.likes,
            }
          : img
      )
    );

    if (
      selectedImage &&
      Number(selectedImage.id) === Number(updatedImage.id)
    ) {
      setSelectedImage((prev) => ({
        ...prev,
        likes: updatedImage.likes,
      }));
    }

    

notifySuccess(
  `❤️ ${updatedImage.title} received a new like`
);



  } catch (err) {
    console.error(err);

    notifyError("Failed to like image");
  }
};
const addFavorite = async (imageId) => {

  

  try {

    const token =
      localStorage.getItem("token");
      

    await addFavoriteRequest(
      imageId,
      token
    );



    notifySuccess(
      "⭐ Image added to Favorites"
    );

  } catch (err) {
  console.error("Favorite Error:", err);

  

  notifyError("Failed to add favorite");
}

};
const downloadImage = async (image) => {

  try {

    const token =
      localStorage.getItem("token");

    const res =
      await downloadImageRequest(
        image.id,
        token
      );

    const updatedImage =
      res.data;
      

setImages((prevImages) =>
  prevImages.map((img) =>
    Number(img.id) === Number(updatedImage.id)
      ? updatedImage
      : img
  )
);

if (
  selectedImage &&
  Number(selectedImage.id) ===
    Number(updatedImage.id)
) {
  setSelectedImage(updatedImage);
}

// Show toast FIRST
notifySuccess(
  `⬇ Downloaded "${updatedImage.title}"`
);

// Start download after a tiny delay
setTimeout(() => {
  const imageUrl =
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`;

  const link = document.createElement("a");

  link.href = imageUrl;
  link.download = image.filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}, 100);



  } catch (err) {

    console.error(err);

    notifyError(
      "Failed to download image"
    );

  }

};
const shareImage = async (image) => {

  try {

    

    const imageUrl =
      `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`;

    await navigator.clipboard.writeText(imageUrl);

    notifySuccess(
      "📤 Image link copied"
    );

  } catch (err) {

    console.error(err);

    notifyError(
      "Failed to share image"
    );

  }

};

  return {
  likeImage,
  addFavorite,
  downloadImage,
  shareImage,
};

}
