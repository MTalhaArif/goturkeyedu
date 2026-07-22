import { universities } from "@/app/data/universities";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Slugs are derived from `name` and deduplicated by appending the university's
// `id` if two names collide (none do today, but this keeps it safe if data changes).
const slugToUniversity = new Map();
const universityIdToSlug = new Map();
const seenSlugCounts = new Map();

for (const uni of universities) {
  let slug = slugify(uni.name);
  const seenCount = seenSlugCounts.get(slug) || 0;
  seenSlugCounts.set(slug, seenCount + 1);
  if (seenCount > 0) slug = `${slug}-${uni.id}`;
  slugToUniversity.set(slug, uni);
  universityIdToSlug.set(uni.id, slug);
}

export function getUniversitySlug(uni) {
  return universityIdToSlug.get(uni.id);
}

export function getUniversityBySlug(slug) {
  return slugToUniversity.get(slug);
}

export function getAllUniversitySlugs() {
  return Array.from(slugToUniversity.keys());
}
