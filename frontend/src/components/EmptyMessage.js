function EmptyMessage({ loading, filteredImages }) {

  if (loading || filteredImages.length > 0)
    return null;

  return (
    <h2>
      No images found.
    </h2>
  );

}

export default EmptyMessage;