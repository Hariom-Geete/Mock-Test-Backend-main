import express
  from "express";

import {
  createSupportTicket
} from "./support.controller.js";

import {
  protect,
  authorize
} from "../../middlewares/auth.middleware.js";

const router =
  express.Router();

router.post(
  "/ticket",

  protect,

  authorize(
    "student",
    "institute",
    "super-admin"
  ),

  createSupportTicket
);

export default router;