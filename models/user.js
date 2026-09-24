const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name zaroori hai"], trim: true },
    email: { type: String, required: [true, "Email zaroori hai"], unique: true, trim: true, lowercase: true },
    password: { type: String, required: [true, "Password zaroori hai"], minlength: 6, select: false },
    // select: false - matlab password by default kisi query mein wapas nahi aayega (security)
  },
  { timestamps: true }
);

// Save karne se PEHLE password ko hash (encrypt) kar do
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // agar password change nahi hua to skip karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login ke waqt entered password ko hashed password se compare karne ka method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);