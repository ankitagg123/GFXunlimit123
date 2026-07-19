function matchesCategoryFilter(image, selectedCategory) {
  const categoryValue = (selectedCategory || "").toLowerCase();
  const text = `${image.category || ""} ${image.collection || ""} ${image.title || ""} ${image.keywords || ""}`.toLowerCase();

  if (!categoryValue || categoryValue === "all") {
    return true;
  }

  if (categoryValue === "photos") {
    return text.includes("photo") || text.includes("photography");
  }

  if (categoryValue === "vectors") {
    return text.includes("vector") || text.includes("illustration");
  }

  if (categoryValue === "psds") {
    return text.includes("psd");
  }

  if (categoryValue === "videos") {
    return text.includes("video") || text.includes("animation");
  }

  if (categoryValue === "templates") {
    return text.includes("template");
  }

  return (image.category || "").toLowerCase() === categoryValue;
}

export default function useFilteredImages({
  images,
  search,
  selectedCategory,
  selectedCollection,
  sortType,
}) {

  let filteredImages = images.filter((image) => {

    const title =
      (image.title || "").toLowerCase();

    const category =
      (image.category || "").toLowerCase();

    const keywords =
      (image.keywords || "").toLowerCase();

    const searchText =
      search.toLowerCase();

    const matchesSearch =
      title.includes(searchText) ||
      category.includes(searchText) ||
      keywords.includes(searchText);

    const matchesCategory = matchesCategoryFilter(image, selectedCategory);

    const matchesCollection =
      selectedCollection === "All" ||
      image.collection === selectedCollection;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCollection
    );

  });

  if (sortType === "likes") {

    filteredImages.sort(
      (a, b) =>
        (b.likes || 0) -
        (a.likes || 0)
    );

  }

  if (sortType === "downloads") {

    filteredImages.sort(
      (a, b) =>
        (b.downloads || 0) -
        (a.downloads || 0)
    );

  }

  if (sortType === "views") {

    filteredImages.sort(
      (a, b) =>
        (b.views || 0) -
        (a.views || 0)
    );

  }

  if (sortType === "newest") {

    filteredImages.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

  }

  if (sortType === "oldest") {

    filteredImages.sort(
      (a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
    );

  }

  return filteredImages;

}