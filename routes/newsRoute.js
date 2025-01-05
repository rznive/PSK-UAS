const express = require("express");
const router = express.Router();
const {
  getActivityReportsHandler,
  createCommentHandler,
  getCommentsHandler,
  deleteCommentHandler,
} = require("../models/getNews");

router.get("/", getActivityReportsHandler);
router.post("/comments", createCommentHandler);
router.get("/comments/:activity_report_id", getCommentsHandler);
router.delete("/comments/:id", deleteCommentHandler);

module.exports = router;
