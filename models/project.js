const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Project title zaroori hai"], trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["planning", "active", "done"], default: "planning" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);