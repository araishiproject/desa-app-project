const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profile },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Add address
exports.addAddress = async (req, res, next) => {
  try {
    const { label, street, city, province, postalCode, coordinates, isDefault } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    user.addresses.push({
      label,
      street,
      city,
      province,
      postalCode,
      coordinates,
      isDefault
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, street, city, province, postalCode, coordinates, isDefault } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          "addresses.$[addr]": {
            label,
            street,
            city,
            province,
            postalCode,
            coordinates,
            isDefault
          }
        }
      },
      {
        arrayFilters: [{ "addr._id": addressId }],
        new: true
      }
    );
    
    res.json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
