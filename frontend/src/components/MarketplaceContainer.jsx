import ImageGallery from "./home/ImageGallery";
import LoadingMessage from "./LoadingMessage";
import EmptyMessage from "./EmptyMessage";
import ImageGrid from "./ImageGrid";
import Pagination from "./Pagination";
import GalleryImageViewer from "./gallery/GalleryImageViewer";
import ContributorPopup from "./gallery/ContributorPopup";

export default function MarketplaceContainer(props) {
  return (
    <>
      <ImageGallery {...props.galleryProps} />

      <LoadingMessage
        loading={props.loading}
      />

      <EmptyMessage
        loading={props.loading}
        filteredImages={props.filteredImages}
      />

      <ImageGrid
        filteredImages={props.filteredImages}
        darkMode={props.darkMode}
        fetchSingleImage={props.fetchSingleImage}
        likeImage={props.likeImage}
        addFavorite={props.addFavorite}
        downloadImage={props.downloadImage}
        shareImage={props.shareImage}
      />

      <Pagination
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        totalImages={props.totalImages}
        setCurrentPage={props.setCurrentPage}
      />

      <GalleryImageViewer
        selectedImage={props.selectedImage}
        setSelectedImage={props.setSelectedImage}
        darkMode={props.darkMode}
        relatedImages={props.relatedImages}
        fetchSingleImage={props.fetchSingleImage}
        goToPreviousImage={props.goToPreviousImage}
        goToNextImage={props.goToNextImage}
        likeImage={props.likeImage}
        addFavorite={props.addFavorite}
        downloadImage={props.downloadImage}
        shareImage={props.shareImage}
      />

      <ContributorPopup
        selectedContributor={props.selectedContributor}
        setSelectedContributor={
          props.setSelectedContributor
        }
        darkMode={props.darkMode}
        contributorImages={props.contributorImages}
        contributorLikes={props.contributorLikes}
        contributorViews={props.contributorViews}
        contributorDownloads={
          props.contributorDownloads
        }
        contributorBestImage={
          props.contributorBestImage
        }
        fetchSingleImage={props.fetchSingleImage}
      />
    </>
  );
}