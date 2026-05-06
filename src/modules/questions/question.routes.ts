import express
    from "express";

import {
    protect,
    authorize,
} from "../../middlewares/auth.middleware.js";

import {
    createQuestionController,
    getQuestionsController,
    getSingleQuestionController,
    updateQuestionController,
    deleteQuestionController,
    getAllQuestionsController,
} from "./question.controller.js";

import { validate }
    from "../../middlewares/validate.js";

import {
    createQuestionSchema,
    updateQuestionSchema,
} from "./question.validation.js";

const router =
    express.Router();

// CREATE QUESTION
router.post(
    "/",

    protect,

    authorize("institute"),

    validate(createQuestionSchema),

    createQuestionController
);

// GET ALL QUESTIONS
router.get(
    "/",

    protect,

    authorize("institute"),

    getAllQuestionsController
);

// GET QUESTIONS
// BY TEST

router.get(
    "/test/:testId",

    protect,

    authorize("institute", "student"),

    getQuestionsController
);

// GET SINGLE QUESTION

router.get(
    "/:id",

    protect,

    authorize("institute"),

    getSingleQuestionController
);

// UPDATE QUESTION

router.patch(
    "/:id",

    protect,

    authorize("institute"),

    validate(updateQuestionSchema),

    updateQuestionController
);


// DELETE QUESTION

router.delete(
    "/:id",

    protect,

    authorize("institute"),

    deleteQuestionController
);

export default router;