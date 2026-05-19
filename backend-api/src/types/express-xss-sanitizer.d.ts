declare module 'express-xss-sanitizer' {
  import { RequestHandler } from 'express';
  export function xss(): RequestHandler;
  export function xssMiddleware(): RequestHandler;
  const xssSanitizer: RequestHandler;
  export default xssSanitizer;
}
