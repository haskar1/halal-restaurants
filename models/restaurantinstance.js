const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RestaurantInstanceSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  address: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  price: {
    type: String,
    enum: ["$", "$$", "$$$", "$$$$"],
    required: true
  },
});

// Virtual for restaurant instance's URL
RestaurantInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/restaurantinstance/${this._id}`;
});

// Export model
module.exports = mongoose.model("RestaurantInstance", RestaurantInstanceSchema);
