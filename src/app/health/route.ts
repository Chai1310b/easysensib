// Liveness probe endpoint. Local monitors and future deployment health checks
// probe this path; without it the 404 gets the dev server killed by the prober.
export function GET() {
  return Response.json({ status: 'ok' });
}
