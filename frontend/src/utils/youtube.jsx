export const getEmbedUrl = (url) => {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};
