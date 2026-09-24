const express = require("express");
const router = express.Router();
const { suggestTasks } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.post("/suggest-tasks", suggestTasks);

module.exports = router;