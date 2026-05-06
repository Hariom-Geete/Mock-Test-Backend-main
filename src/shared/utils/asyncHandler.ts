import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import type { ParamsDictionary } from "express-serve-static-core";
/**
 * Wrap async controllers to automatically catch errors
 * and forward them to global error handler
 */

/**
 * Generic async handler (production level)
 */
export const asyncHandler = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => any
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};