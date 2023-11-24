const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  location: [{ type: Schema.Types.ObjectId, ref: "Location", required: true }],
  cuisine: [{ type: Schema.Types.ObjectId, ref: "Cuisine", required: true }],
  summary: { type: String },
});

// Virtual for restaurant's URL
RestaurantSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/restaurant/${this._id}`;
});

// Export model
module.exports = mongoose.model("Restaurant", RestaurantSchema);
