/** Mock extraction is disabled. Client pages must call POST /api/extract. */
export async function extractInternshipFromPost(): Promise<never> {
  throw new Error("Mock extraction is disabled. Use POST /api/extract.");
}
