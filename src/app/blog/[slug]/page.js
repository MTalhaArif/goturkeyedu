import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/app/data/blogPosts";
import BlogArticleBody from "@/app/components/BlogArticleBody";
import { jsonLdScriptProps } from "@/lib/jsonLd";
import { SITE_URL } from "@/lib/siteConfig";
import Link from "next/link";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Go Turkey Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    author: { "@type": "Organization", name: "Go Turkey" },
    publisher: { "@type": "Organization", name: "Go Turkey" },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <script {...jsonLdScriptProps(articleJsonLd)} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <div className="container" style={{ maxWidth: 800 }}>
        <nav style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          <Link href="/" style={{ color: "var(--text-muted)" }}>Home</Link> {" › "}
          <Link href="/blog" style={{ color: "var(--text-muted)" }}>Blog</Link> {" › "}
          <span>{post.title}</span>
        </nav>

        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase" }}>
          {post.category}
        </div>
        <h1 style={{ fontSize: 34, color: "var(--secondary)", marginBottom: 14 }}>{post.title}</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 30 }}>
          Published {new Date(post.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div style={{ background: "white", borderRadius: 16, padding: "36px 40px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <BlogArticleBody blocks={post.content} />
        </div>

        <div style={{ marginTop: 30, textAlign: "center" }}>
          <a href="/contact" className="btn-primary">Talk to Go Turkey About Your Application</a>
        </div>
      </div>
    </div>
  );
}
