// Each post's `content` is a small list of typed blocks rendered by BlogArticleBody
// (src/app/components/BlogArticleBody.js). Supported block types:
//   { h2: "..." }              section heading
//   { p: "..." }                paragraph
//   { ul: ["...", "..."] }      bullet list
// Keep facts (tuition, exam structure, program lengths) consistent with the static
// pages under /for-students/*, /tryos, and /universities/* — this data isn't
// cross-checked against those automatically, so update both sides if either changes.
export const blogPosts = [
  {
    slug: "study-medicine-in-turkey",
    title: "Studying Medicine in Turkey: A Complete Guide for International Students",
    description: "Everything international students need to know about studying medicine in Turkey: top English-taught medical schools, tuition costs, program length, and admission requirements.",
    category: "Programs",
    publishedDate: "2026-07-23",
    excerpt: "Medicine is the single most-searched program among international students looking at Turkey. Here's what the six-year degree actually involves, what it costs, and which universities teach it in English.",
    content: [
      { p: "Medicine is consistently the most-searched program among international students considering Turkey, and it's easy to see why: English-taught medical degrees, modern teaching hospitals, and tuition that runs a fraction of equivalent programs in the UK, US, or EU." },
      { h2: "How long does a medical degree in Turkey take?" },
      { p: "A Turkish medical degree (Tıp Fakültesi) is six years, split into two phases. The first three years cover theoretical and pre-clinical sciences — anatomy, physiology, biochemistry, and introductory clinical sciences. The final three years move into clinical rotations inside teaching hospitals, culminating in a medical doctor (MD-equivalent) qualification recognized by Turkey's Higher Education Council (YÖK)." },
      { h2: "Which universities teach medicine in English?" },
      { p: "Most state universities teach medicine in Turkish, sometimes with an additional one-year Turkish-language preparatory year for international students who don't yet meet the language requirement. If you want to study entirely in English, look at foundation (private) universities with a dedicated International School of Medicine — Istanbul Medipol University and Yeditepe University are two well-established examples with fully English-medium medical programs and their own affiliated teaching hospitals." },
      { ul: [
        "State universities: mostly Turkish-medium, tuition is lower, often requires a Turkish preparatory year",
        "Foundation (private) universities: more likely to offer full English-medium medical programs, higher tuition, modern facilities and hospital partnerships",
      ] },
      { p: "You can check any university's full program list — including whether Medicine is offered — on its profile page in our University Directory." },
      { h2: "What does it cost?" },
      { p: "Tuition for English-medium medical programs at private universities typically runs from the high five figures into the tens of thousands of USD per year, considerably higher than other degree programs in Turkey but still well below equivalent private medical schools in Western Europe or North America. State university medical programs, where available in English or after a Turkish-language year, are significantly cheaper. Combined with living costs in the range of $400–800/month depending on the city, Turkey remains one of the more affordable routes into a globally recognized medical degree — see our full breakdown on the for-students scholarships and cost pages for financing options, including Türkiye Bursları." },
      { h2: "Admission requirements" },
      { p: "Requirements vary by university, but generally include a completed high school diploma with strong grades in biology, chemistry, and physics, a valid passport, and — for English-medium programs — proof of English proficiency (IELTS/TOEFL, or a university-administered English exam) if your prior education wasn't in English. Some state universities require or accept the TR-YÖS exam as part of admission; see our TR-YÖS guide for how that exam works." },
      { h2: "Next steps" },
      { p: "Browse medical programs by university and city in our University Directory, or get in touch and we'll help you shortlist universities that match your budget, target city, and language preference." },
    ],
  },
];

export function getAllBlogSlugs() {
  return blogPosts.map((post) => post.slug);
}

export function getBlogPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}
