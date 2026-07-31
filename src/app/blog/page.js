import { blogPosts } from "@/app/data/blogPosts";

export const metadata = {
  title: "Study in Türkiye Blog - Guides for International Students | Go Turkey",
  description: "Guides on studying in Türkiye: programs, tuition, scholarships, visas, and student life, written for international students planning to apply.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        <div
          style={{
            background: "var(--secondary)",
            borderRadius: 16,
            padding: "40px 50px",
            marginBottom: 40,
            color: "white",
          }}
        >
          <h1 style={{ fontSize: 36, marginBottom: 10 }}>Go Turkey Blog</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>
            Guides on programs, tuition, scholarships, visas, and student life in Türkiye.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                display: "block",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase" }}>
                {post.category}
              </div>
              <h2 style={{ fontSize: 19, color: "var(--secondary)", marginBottom: 10 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
