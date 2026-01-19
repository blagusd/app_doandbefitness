const VideoPlayer = ({ url }) => {
  const embed = url.replace("watch?v=", "embed/");
  return (
    <iframe width="100%" height="315" src={embed} allowFullScreen></iframe>
  );
};

export default VideoPlayer;
