export default function BlogArticleBody({ blocks }) {
  return (
    <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)" }}>
      {blocks.map((block, i) => {
        if (block.h2) {
          return (
            <h2 key={i} style={{ fontSize: 24, color: "var(--secondary)", marginTop: 36, marginBottom: 14 }}>
              {block.h2}
            </h2>
          );
        }
        if (block.ul) {
          return (
            <ul key={i} style={{ marginBottom: 20, paddingLeft: 22 }}>
              {block.ul.map((item, j) => (
                <li key={j} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ marginBottom: 20 }}>
            {block.p}
          </p>
        );
      })}
    </div>
  );
}
