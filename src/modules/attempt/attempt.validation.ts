import { z }
from "zod";

import mongoose
from "mongoose";

export const startAttemptSchema =
z.object({

  testId:
    z.string().refine(

      (val) =>

        mongoose.Types.ObjectId.isValid(
          val
        ),

      {
        message:
          "Invalid test ID",
      }
    ),
});