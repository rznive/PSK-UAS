const express = require("express");
const router = express.Router();
const {
  getActivityReportsHandler,
  getActivityReportByIdHandler,
  createCommentHandler,
  updateCommentHandler,
  getCommentsHandler,
  deleteCommentHandler,
} = require("../models/getNews");

router.get("/", getActivityReportsHandler);
router.get("/:id", getActivityReportByIdHandler);
router.post("/comments", createCommentHandler);
router.put("/comments/:id", updateCommentHandler);
router.get("/comments/:activity_report_id", getCommentsHandler);
router.delete("/comments/:id", deleteCommentHandler);

module.exports = router;
