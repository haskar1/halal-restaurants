const RestaurantInstance = require("../models/restaurantinstance");
const Restaurant = require("../models/restaurant");
const Location = require("../models/location");
const Cuisine = require("../models/cuisine");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all RestaurantInstances.
exports.restaurantinstance_list = asyncHandler(async (req, res, next) => {
  const allRestaurantInstances = await RestaurantInstance.find()
    .sort({ name: 1 })
    .populate({
      path: 'restaurant',
      populate: { path: 'cuisine' } // Populate the cuisine array within each restaurant
    })
    .populate('location')
    .exec();

  res.render("pages/restaurantinstance_list", {
    title: "Restaurant Instance List",
    restaurantinstance_list: allRestaurantInstances,
  });
});


// Display detail page for a specific RestaurantInstance.
exports.restaurantinstance_detail = asyncHandler(async (req, res, next) => {
  const restaurantInstance = await RestaurantInstance.findById(req.params.id)
    .populate({
      path: 'restaurant',
      populate: { path: 'cuisine' }, // Populate the cuisine array within the restaurant
    })
    .populate("location")
    .exec();

  if (restaurantInstance === null) {
    // No results.
    const err = new Error("Restaurant location not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/restaurantinstance_detail", {
    title: "Restaurant:",
    restaurantinstance: restaurantInstance,
  });
});


// Display RestaurantInstance create form on GET.
exports.restaurantinstance_create_get = asyncHandler(async (req, res, next) => {
  // Get all locations and restaurants for form.
  const [allLocations, allRestaurants] = await Promise.all([
    Location.find().exec(),
    Restaurant.find().exec(),
  ]);

  res.render("pages/restaurantinstance_form", {
    title: "Create Restaurant Instance",
    restaurant_list: allRestaurants,
    locations: allLocations,
  });
});


// Handle RestaurantInstance create on POST.
exports.restaurantinstance_create_post = [
  // Validate and sanitize fields.
  body("restaurant", "Restaurant must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("location.*", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("address", "Address must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("rating")
    .optional({ values: "falsy" })
    .isNumeric()
    .trim(),
    // .escape(),
  body("price", "Price must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a RestaurantInstance object with escaped and trimmed data.
    const restaurantInstance = new RestaurantInstance({
      restaurant: req.body.restaurant,
      location: req.body.location,
      address: req.body.address,
      rating: req.body.rating,
      // summary: req.body.summary,
      price: req.body.price,
      // cuisines: req.body.cuisines,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      
      // Get all locations and restaurants for form.
      const [allLocations, allRestaurants] = await Promise.all([
        Location.find().exec(),
        Restaurant.find().exec(),
      ]);

      res.render("pages/restaurantinstance_form", {
        title: "Create Restaurant Instance",
        restaurant_list: allRestaurants,
        selected_restaurant: restaurantInstance.restaurant._id,
        restaurantinstance: restaurantInstance,
        locations: allLocations,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      await restaurantInstance.save();
      res.redirect(restaurantInstance.url);
    }
  }),
];


// Display RestaurantInstance delete form on GET.
exports.restaurantinstance_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of restaurantinstance and all their restaurants (in parallel)
  const restaurantinstance = await RestaurantInstance.findById(req.params.id)
    .populate({
      path: 'restaurant',
      populate: { path: 'cuisine' }, // Populate the cuisine array within the restaurant
    })
    .populate("location")
    .exec();

  if (restaurantinstance === null) {
    // No results.
    res.redirect("/restaurantinstances");
  }

  res.render("pages/restaurantinstance_delete", {
    title: "Delete Restaurant Instance",
    restaurantinstance: restaurantinstance,
  });
});


// Handle RestaurantInstance delete on POST.
exports.restaurantinstance_delete_post = asyncHandler(async (req, res, next) => {
  await RestaurantInstance.findByIdAndDelete(req.body.restaurantinstanceid);
  res.redirect("/restaurantinstances");
});


// Display RestaurantInstance update form on GET.
exports.restaurantinstance_update_get = asyncHandler(async (req, res, next) => {
  // Get restaurantinstance, locations and restaurants for form.
  const [restaurantinstance, allRestaurants, allLocations] = await Promise.all([
    RestaurantInstance.findById(req.params.id).populate("restaurant").populate("location").exec(),
    Restaurant.find().exec(),
    Location.find().exec(),
  ]);

  if (restaurantinstance === null) {
    // No results.
    const err = new Error("RestaurantInstance not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/restaurantinstance_form", {
    title: "Update RestaurantInstance",
    locations: allLocations,
    restaurant_list: allRestaurants,
    restaurantinstance: restaurantinstance,
  });
});


// Handle RestaurantInstance update on POST.
exports.restaurantinstance_update_post = [
  // Validate and sanitize fields.
  body("restaurant", "Restaurant must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("location.*", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("address", "Address must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),
  body("rating")
    .optional({ values: "falsy" })
    .isNumeric()
    .trim(),
    // .escape(),
  body("price", "Price must be specified")
    .trim()
    .isLength({ min: 1 }),
    // .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a RestaurantInstance object with escaped and trimmed data.
    const restaurantInstance = new RestaurantInstance({
      restaurant: req.body.restaurant,
      location: req.body.location,
      address: req.body.address,
      rating: req.body.rating,
      price: req.body.price,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      
      // Get all locations and restaurants for form.
      const [allLocations, allRestaurants] = await Promise.all([
        Location.find().exec(),
        Restaurant.find().exec(),
      ]);

      res.render("pages/restaurantinstance_form", {
        title: "Update Restaurant Instance",
        restaurant_list: allRestaurants,
        selected_restaurant: restaurantInstance.restaurant._id,
        restaurantinstance: restaurantInstance,
        locations: allLocations,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedRestaurantInstance = await RestaurantInstance.findByIdAndUpdate(req.params.id, restaurantInstance, {});
      // Redirect to restaurantinstance detail page.
      res.redirect(updatedRestaurantInstance.url);
    }
  }),
];
