function LoadingMessage({ loading }) {
  if (!loading) return null;

  return (
    <h2>
      Loading images...
    </h2>
  );
}

export default LoadingMessage;