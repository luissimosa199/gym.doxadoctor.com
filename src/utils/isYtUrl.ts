export function isYtUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(?:&.*|\?.*)?$/;
  return youtubeRegex.test(url);
}


export function extractVideoId(url: string): string | null {
  const regexes = [
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
    /^https?:\/\/www\.youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})(?:&.*|$)/, // Changed this regex
    /^https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractTimestamp(url: string): number | null {
  const match = url.match(/[?&]t=(\d+)/); // Changed the regex here
  return match ? parseInt(match[1], 10) : null;
}
