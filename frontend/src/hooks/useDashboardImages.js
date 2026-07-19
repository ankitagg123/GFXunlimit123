import {
  getFeaturedImages,
  getTrendingImages,
  getTopImage,
} from "../utils/dashboardUtils";

export default function useDashboardImages(images) {
  const featuredImages =
    getFeaturedImages(images);

  const trendingImages =
    getTrendingImages(images);

  const topImage =
    getTopImage(images);

  const topFiveImages = [...images]
    .sort(
      (a, b) =>
        ((b.likes || 0) +
          (b.views || 0) +
          (b.downloads || 0)) -
        ((a.likes || 0) +
          (a.views || 0) +
          (a.downloads || 0))
    )
    .slice(0, 5);

  return {
    featuredImages,
    trendingImages,
    topImage,
    topFiveImages,
  };
}