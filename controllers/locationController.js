const Location = require("../models/location");
const Restaurant = require("../models/restaurant");
const RestaurantInstance = require("../models/restaurantinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all locations.
exports.location_list = asyncHandler(async (req, res, next) => {
  const allLocations = await Location.find().sort({ name: 1 }).exec();

  res.render("pages/location_list", { 
    title: "Location List", 
    location_list: allLocations,
  });
});


// Display detail page for a specific Location.
exports.location_detail = asyncHandler(async (req, res, next) => {
  // Get details of location and all their restaurants (in parallel)
  const [location, allRestaurantInstancesByLocation] = await Promise.all([
    Location.findById(req.params.id).exec(),
    RestaurantInstance.find({ location: req.params.id })
      .sort({ name: 1 })
      .populate({
        path: 'restaurant',
        populate: { path: 'cuisine' } // Populate the cuisine array within each restaurant
      })
      .populate('location')
      .exec(),
  ]);

  if (location === null) {
    // No results.
    const err = new Error("Location not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/location_detail", {
    title: `Halal Restaurants in ${location.city}`,
    location: location,
    location_restaurantinstances: allRestaurantInstancesByLocation,
  });
});


// Handle Location create on GET.
exports.location_create_get = asyncHandler(async (req, res, next) => {
  res.render("pages/location_form", { title: "Create Location" });
});


// Handle Location create on POST.
exports.location_create_post = [
  // Validate and sanitize fields.
  body("city")
    .trim()
    .isLength({ min: 1 })
    .withMessage("City must be specified."),
    // .escape(),
  body("state")
    .optional({ values: "falsy" })
    .trim(),
    // .escape(),
  body("country")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Country must be specified."),
    // .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Location object with escaped and trimmed data
    const location = new Location({
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("pages/location_form", {
        title: "Create Location",
        location: location,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Save location.
      await location.save();
      // Redirect to new location record.
      res.redirect(location.url);
    }
  }),
];


// Display Location delete form on GET.
exports.location_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of location and all their restaurants (in parallel)
  const [location, allRestaurantsByLocation] = await Promise.all([
    Location.findById(req.params.id).exec(),
    Restaurant.find({ location: req.params.id }).exec(),
  ]);

  if (location === null) {
    // No results.
    res.redirect("/locations");
  }

  res.render("pages/location_delete", {
    title: "Delete Location",
    location: location,
    location_restaurants: allRestaurantsByLocation,
  });
});


// Handle Location delete on POST.
exports.location_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of location and all their restaurants (in parallel)
  const [location, allRestaurantsByLocation] = await Promise.all([
    Location.findById(req.params.id).exec(),
    Restaurant.find({ location: req.params.id }).exec(),
  ]);

  if (allRestaurantsByLocation.length > 0) {
    // Location has restaurants. Render in same way as for GET route.
    res.render("pages/location_delete", {
      title: "Delete Location",
      location: location,
      location_restaurants: allRestaurantsByLocation,
    });
    return;
  } else {
    // Location has no restaurants. Delete object and redirect to the list of locations.
    await Location.findByIdAndDelete(req.body.locationid);
    res.redirect("/locations");
  }
});


// Display location update form on GET.
exports.location_update_get = asyncHandler(async (req, res, next) => {
  // Get location for form.
  const location = await Location.findById(req.params.id).exec();

  if (location === null) {
    // No results.
    const err = new Error("Location not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/location_form", {
    title: "Update Location",
    location: location,
  });
});


// Handle location update on POST.
exports.location_update_post = [
  // Validate and sanitize fields.
  body("city")
    .trim()
    .isLength({ min: 1 })
    .withMessage("City must be specified."),
    // .escape(),
  body("state")
    .optional({ values: "falsy" })
    .trim(),
    // .escape(),
  body("country")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Country must be specified."),
    // .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Location object with escaped and trimmed data
    const location = new Location({
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("pages/location_form", {
        title: "Update Location",
        location: location,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedLocation = await Location.findByIdAndUpdate(req.params.id, location, {});
      // Redirect to location detail page.
      res.redirect(updatedLocation.url);
    }
  }),
];
