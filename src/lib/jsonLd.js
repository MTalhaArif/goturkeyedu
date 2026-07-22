// Next.js's recommended JSON-LD pattern: JSON.stringify doesn't escape "<", which would let
// a "</script>" inside string data break out of the script tag, so it's replaced with its
// unicode equivalent before being injected via dangerouslySetInnerHTML.
export function jsonLdScriptProps(data) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  };
}
