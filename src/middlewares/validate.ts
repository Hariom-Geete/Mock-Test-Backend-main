import type {

  Request,

  Response,

  NextFunction

} from "express";

import type {
  ZodSchema
} from "zod";

export const validate =
(schema: ZodSchema) =>

(

  req: Request,

  res: Response,

  next: NextFunction
) => {

  // ✅ MERGE ALL REQUEST DATA
  const requestData = {

    ...req.body,

    ...req.params,

    ...req.query,
  };

  // ✅ VALIDATE
  const result =
    schema.safeParse(
      requestData
    );

  // ❌ VALIDATION FAILED
  if (!result.success) {

    return res.status(400).json({

      success: false,

      message:
        "Validation failed",

      errors:
        result.error.issues.map(

          (err) => ({

            field:
              err.path.join("."),

            message:
              err.message,
          })
        ),
    });
  }

  // ✅ REPLACE BODY WITH SANITIZED DATA
  req.body = result.data;

  next();
};