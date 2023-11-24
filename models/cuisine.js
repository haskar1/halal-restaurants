const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CuisineSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

// Virtual for Cuisine's URL
CuisineSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/cuisine/${this._id}`;
});

// Export model
module.exports = mongoose.model("Cuisine", CuisineSchema);

