const Cuisine = require("../models/cuisine");
const Restaurant = require("../models/restaurant");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all cuisines.
exports.cuisine_list = asyncHandler(async (req, res, next) => {
  const allCuisines = await Cuisine.find().sort({ name: 1 }).exec();

  res.render("pages/cuisine_list", { 
    title: "Cuisine List", 
    cuisine_list: allCuisines,
  });
});


// Display detail page for a specific Cuisine.
exports.cuisine_detail = asyncHandler(async (req, res, next) => {
  // Get details of cuisine and all associated restaurants (in parallel)
  const [cuisine, restaurantsInCuisine] = await Promise.all([
    Cuisine.findById(req.params.id).exec(),
    Restaurant.find({ cuisine: req.params.id }).exec(),
  ]);
  if (cuisine === null) {
    // No results.
    const err = new Error("Cuisine not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/cuisine_detail", {
    title: "Cuisine Detail",
    cuisine: cuisine,
    cuisine_restaurants: restaurantsInCuisine,
  });
});


// Display cuisine create form on GET.
exports.cuisine_create_get = asyncHandler(async (req, res, next) => {
  res.render("pages/cuisine_form", { title: "Create Cuisine" });
});


// Handle Cuisine create on POST.
exports.cuisine_create_post = [
  // Validate and sanitize the name field.
  body("name", "Cuisine name must be at least 3 characters long")
    .trim()
    .isLength({ min: 3 }),
    //.escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a cuisine object with escaped and trimmed data.
    const cuisine = new Cuisine({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("pages/cuisine_form", {
        title: "Create Cuisine",
        cuisine: cuisine,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Cuisine with same name already exists.
      const cuisineExists = await Cuisine.findOne({ name: req.body.name }).exec();
      if (cuisineExists) {
        // Cuisine exists, redirect to its detail page.
        res.redirect(cuisineExists.url);
      } else {
        await cuisine.save();
        // New cuisine saved. Redirect to cuisine detail page.
        res.redirect(cuisine.url);
      }
    }
  }),
];


// Display Cuisine delete form on GET.
exports.cuisine_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of cuisine and all associated restaurants (in parallel)
  const [cuisine, restaurantsInCuisine] = await Promise.all([
    Cuisine.findById(req.params.id).exec(),
    Restaurant.find({ cuisine: req.params.id }).exec(),
  ]);
  if (cuisine === null) {
    // No results.
    const err = new Error("Cuisine not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/cuisine_delete", {
    title: "Delete Cuisine",
    cuisine: cuisine,
    cuisine_restaurants: restaurantsInCuisine,
  });
});


// Handle Cuisine delete on POST.
exports.cuisine_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of cuisine and all their restaurants (in parallel)
  const [cuisine, allRestaurantsByCuisine] = await Promise.all([
    Cuisine.findById(req.params.id).exec(),
    Restaurant.find({ cuisine: req.params.id }).exec(),
  ]);

  if (allRestaurantsByCuisine.length > 0) {
    // Cuisine has restaurants. Render in same way as for GET route.
    res.render("pages/cuisine_delete", {
      title: "Delete Cuisine",
      cuisine: cuisine,
      cuisine_restaurants: allRestaurantsByCuisine,
    });
    return;
  } else {
    // Cuisine has no Restaurants. Delete object and redirect to the list of cuisines.
    await Cuisine.findByIdAndDelete(req.body.cuisineid);
    res.redirect("/cuisines");
  }
});


// Display cuisine update form on GET.
exports.cuisine_update_get = asyncHandler(async (req, res, next) => {
  // Get cuisine for form.
  const cuisine = await Cuisine.findById(req.params.id).exec();

  if (cuisine === null) {
    // No results.
    const err = new Error("Cuisine not found");
    err.status = 404;
    return next(err);
  }

  res.render("pages/cuisine_form", {
    title: "Update Cuisine",
    cuisine: cuisine,
  });
});


// Handle Cuisine update on POST.
exports.cuisine_update_post = [
  // Validate and sanitize the name field.
  body("name", "Cuisine name must be at least 3 characters long")
    .trim()
    .isLength({ min: 3 }),
    //.escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a cuisine object with escaped and trimmed data.
    const cuisine = new Cuisine({ 
      name: req.body.name,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("pages/cuisine_form", {
        title: "Update Cuisine",
        cuisine: cuisine,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
        // To-do: Check if Cuisine with same name already exists?
      const updatedCuisine = await Cuisine.findByIdAndUpdate(req.params.id, cuisine, {});
      // Redirect to cuisine detail page.
      res.redirect(updatedCuisine.url);
    }
  }),
];
