const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer"
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  seller: {
    shopName: String,
    shopDescription: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationDate: Date
  },
  addresses: [{
    label: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
