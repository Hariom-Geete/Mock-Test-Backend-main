import express
  from "express";

import {
  demoRequestController
} from "./contact.controller.js";

const router =
  express.Router();

router.post(
  "/demo",
  demoRequestController
);

export default router;