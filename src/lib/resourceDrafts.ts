export function createWritingResourceId({
  title,
  prompt,
  grades,
  genre,
}: {
  title: string;
  prompt: string;
  grades: string[];
  genre: string;
}) {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "writing";
  const source = `${title}|${prompt}|${grades.join(",")}|${genre}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return `wr-${slug}-${hash.toString(36)}`;
}
