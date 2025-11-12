/**
 * CORS Configuration for Edge Functions
 *
 * Restricts cross-origin requests to approved domains only
 */

// Allowed origins - ONLY these domains can make requests
const ALLOWED_ORIGINS = [
  'https://srhaiadmin.odia.dev',
  'https://srhbackend.odia.dev',
  'https://web-llswgxr6b-odia-backends-projects.vercel.app',
  'http://localhost:5173',  // Development
  'http://localhost:5174',  // Development (current port)
  'http://localhost:5175',  // Development (alternative port)
  'http://localhost:4173',  // Preview
];

/**
 * Get CORS headers for a request
 *
 * @param req - The incoming request
 * @returns CORS headers object
 */
export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin') || '';

  // Check if origin is allowed
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
                     (origin.startsWith('http://localhost:') && Deno.env.get('ENVIRONMENT') === 'development');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handle OPTIONS preflight requests
 *
 * @param req - The incoming request
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflight(req: Request): Response {
  return new Response('ok', {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

/**
 * Validate origin is allowed
 *
 * @param req - The incoming request
 * @returns true if origin is allowed
 */
export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin') || '';

  return ALLOWED_ORIGINS.includes(origin) ||
         (origin.startsWith('http://localhost:') && Deno.env.get('ENVIRONMENT') === 'development');
}
