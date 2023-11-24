const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true, maxLength: 100 },
});

// Virtual for location's URL
LocationSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/location/${this._id}`;
});

// Export model
module.exports = mongoose.model("Location", LocationSchema);

