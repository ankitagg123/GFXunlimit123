import { useEffect } from "react";
import axios from "axios";
import { getImages } from "../services/imageService";

export default function useImages({
  currentPage,
  imagesPerPage,
  images,
  setImages,
  setLoading,
  setTotalImages,
  setTotalLikes,
  setTotalDownloads,
  setTotalViews,
  setTotalPages,
  selectedImage,
  setSelectedImage,
  setRelatedImages,
}) {

  const fetchImages = async () => {

    try {

      setLoading(true);

      const res = await getImages(
        currentPage,
        imagesPerPage
      );

      setImages(res.data.images);

      setTotalImages(
        res.data.totalImages
      );

      setTotalLikes(
        res.data.totalLikes
      );

      setTotalDownloads(
        res.data.totalDownloads
      );

      setTotalViews(
        res.data.totalViews
      );

      setTotalPages(
        Math.ceil(
          res.data.totalImages /
          imagesPerPage
        )
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };
  useEffect(() => {
  fetchImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentPage]);

  const fetchSingleImage = async (id) => {

    try {

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}/view`
      );

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}`
      );

      setSelectedImage(res.data);

      const related = images
        .filter(
          (img) =>
            img.id !== res.data.id &&
            img.category === res.data.category
        )
        .slice(0, 4);

      setRelatedImages(related);

      setImages((prevImages) =>
        prevImages.map((img) =>
          Number(img.id) === Number(id)
            ? {
                ...img,
                views: res.data.views,
              }
            : img
        )
      );

    } catch (err) {

      console.error(err);

    }

  };

  return {
    fetchImages,
    fetchSingleImage,
  };

}