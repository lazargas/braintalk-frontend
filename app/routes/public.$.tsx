export function loader() {
  // This is a catch-all route that returns 204 No Content for DevTools requests
  // This prevents the 404 errors in the console
  return new Response(null, { status: 204 });
}
