const express = require("express");
const router = express.Router();
const {
  getActivityReportsHandler,
  getActivityReportByIdHandler,
  createCommentHandler,
  getCommentsHandler,
  deleteCommentHandler,
} = require("../models/getNews");

router.get("/", getActivityReportsHandler);
router.get("/:id", getActivityReportByIdHandler);
router.post("/comments", createCommentHandler);
router.get("/comments/:activity_report_id", getCommentsHandler);
router.delete("/comments/:id", deleteCommentHandler);

module.exports = router;
