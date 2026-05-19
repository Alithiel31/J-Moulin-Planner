declare module 'express-xss-sanitizer' {
  import { RequestHandler } from 'express';
  function xss(): RequestHandler;
  export function xssMiddleware(): RequestHandler;
  export default xss;
}
