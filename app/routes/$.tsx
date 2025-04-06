export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  
  // Handle React DevTools source map requests
  if (url.pathname.endsWith('.js.map') && 
      (url.pathname.includes('installHook') || 
       url.pathname.includes('react_devtools'))) {
    return new Response(null, { status: 204 });
  }
  
  // For other unmatched routes, return a 404
  return new Response("Not Found", { status: 404 });
}