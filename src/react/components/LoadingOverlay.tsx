type LoadingOverlayProps = {
  message: string;
};

function LoadingOverlay(props: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <p>{props.message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
