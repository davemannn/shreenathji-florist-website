/**
 * Builds a sized Pexels CDN URL for temporary demo photography.
 *
 * TEMPORARY: standing in for real product/site photography (free-license
 * stock, no Cloudinary account wired up yet). Every call site that uses this
 * should be swapped for a real Cloudinary-hosted image before launch — see
 * the "TEMPORARY" comment on the `images.pexels.com` entry in next.config.ts.
 */
export function pexelsPhoto(id: string, width = 800): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}
