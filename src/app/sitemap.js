import { SITE_URL } from "@/lib/siteConfig";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/StudySearch/List", changeFrequency: "weekly", priority: 0.9 },
  { path: "/StudyinTurkey/Universities", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tryos", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/why-turkiye/10-reasons", changeFrequency: "monthly", priority: 0.7 },
  { path: "/why-turkiye/higher-education-system", changeFrequency: "monthly", priority: 0.7 },
  { path: "/discover/turkiye-at-a-glance", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover/culture", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover/cities", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover/climate", changeFrequency: "monthly", priority: 0.5 },
  { path: "/discover/food-culture", changeFrequency: "monthly", priority: 0.5 },
  { path: "/discover/transportation", changeFrequency: "monthly", priority: 0.5 },
  { path: "/discover/tips-for-students", changeFrequency: "monthly", priority: 0.6 },
  { path: "/discover/learning-turkish", changeFrequency: "monthly", priority: 0.5 },
  { path: "/for-students/what-students-say", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-students/scholarships", changeFrequency: "monthly", priority: 0.8 },
  { path: "/for-students/visa-residence", changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-students/healthcare", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-students/accommodation", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-students/work-opportunities", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-students/recognition", changeFrequency: "monthly", priority: 0.5 },
  { path: "/for-students/qa-videos", changeFrequency: "monthly", priority: 0.5 },
  { path: "/for-students/cohe-news", changeFrequency: "weekly", priority: 0.5 },
  { path: "/for-students/faq", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap() {
  const lastModified = new Date();
  return staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
