import { buildSearchIndex } from "@/lib/search-index";

/**
 * The search index is ~200KB. Serving it as a statically prerendered response
 * the palette fetches on idle keeps it out of every page's HTML payload.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
