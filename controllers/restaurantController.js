const Restaurant = require("../models/restaurant");
const RestaurantInstance = require("../models/restaurantinstance");
const Location = require("../models/location");
const Cuisine = require("../models/cuisine");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
// const he = require('he'); // Require the 'he' library to decode HTML entities to properly display escaped characters on website

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of restaurant, location, cuisine, and restaurant instance counts (in parallel)
  const [
    numRestaurants,
    numLocations,
    numCuisines,
  ] = await Promise.all([
    Restaurant.countDocuments({}).exec(),
    Location.countDocuments({}).exec(),
    Cuisine.countDocuments({}).exec(),
  ]);

  res.render("pages/index", {
    title: "Halal Restaurants Home",
    restaurant_count: numRestaurants,
    location_count: numLocations,
    cuisine_count: numCuisines,
  });
});


// Display list of all restaurants.
exports.restaurant_list = asyncHandler(async (req, res, next) => {
  const allRestaurants = await Restaurant.find({})
    .sort({ name: 1 })
    .populate("location")
    .populate("cuisine")
    .exec();

  res.render("pages/restaurant_list", { 
    title: "Restaurant List", 
    restaurant_list: allRestaurants,
  });
});


// Display detail page for a specific restaurant.
exports.restaurant_detail = asyncHandler(async (req, res, next) => {
  // Get details of restaurants, restaurant instances for specific restaurant
  const [restaurant, restaurantInstances] = await Promise.all([
    Restaurant.findById(req.params.id).populate("location").populate("cuisine").exec(),
    RestaurantInstance.find({ restaurant: req.params.id }).populate("restaurant").populate("location").exec(),
  ]);

  if (restaurant === null) {
    // No results.
    const err = new Error("Restaurant not found");
    err.status = 404;
    return next(err);
  }
  
  res.render("pages/restaurant_detail", {
    title: restaurant.name,
    restaurant: restaurant,
    restaurant_instances: restaurantInstances,
  });

  /* HTML decoder. Doesn't work because there are a lot of objects and arrays in mongodb models so it causes "Maximum call stack size exceeded" error.

  // Decode HTML entities to properly display escaped characters on website (e.g. to display apostrophes properly)
  for (const property in restaurant) {
    if (Array.isArray(restaurant[property])) {
      restaurant[property].forEach(item => {
        for (const innerProperty in item) {
          if (typeof item[innerProperty] === 'string') {
            item[innerProperty] = he.decode(item[innerProperty]); 
          }
        }
      })
    }
    if (typeof restaurant[property] === 'string') {
      restaurant[property] = he.decode(restaurant[property]);
    }
  }

  // Decode HTML entities to properly display escaped characters on website (e.g. to display apostrophes properly)
  restaurantInstances.forEach((restaurantinstance) => {
    console.log(restaurantinstance)

    for (const property in restaurantinstance) {
      console.log(`${property}: ${typeof restaurantinstance[property]}`);
      if (Array.isArray(restaurantinstance[property])) {
        restaurantinstance[property].forEach(item => {
          for (const innerProperty in item) {
            if (typeof item[innerProperty] === 'string') {
              item[innerProperty] = he.decode(item[innerProperty]); 
            }
          }
        })
      }
      elseif (typeof restaurantinstance[property] === 'object') {
        const innerObject = restaurantinstance[property];
        for (const innerProperty in innerObject) {
          if (typeof innerObject[innerProperty] === 'string') {
            item[innerProperty] = he.decode(item[innerProperty]); 
          }
        }
      }
      if (typeof restaurantinstance[property] === 'string') {
        restaurantinstance[property] = he.decode(restaurantinstance[property]);
      }
    }
  })

  function decodeStrings(object) {
      console.log(object)
    for (const property in object) {
      if (Array.isArray(object[property])) {
        const innerArray = object[property];
        innerArray.forEach(obj => {
          decodeStrings(obj);
        });
      }
      else if (typeof object[property] === 'object') {
        const innerObject = object[property];
        decodeStrings(innerObject);
      }
      else if (typeof object[property] === 'string') {
        object[property] = he.decode(object[property]);
      }
    }

  decodeStrings(restaurant);

  restaurantInstances.forEach((restaurantinstance) => {
    decodeStrings(restaurantinstance);
  });
  */
});


// Display restaurant create form on GET.
exports.restaurant_create_get = asyncHandler(async (req, res, next) => {
  // Get all locations and cuisines, which we can use for adding to our restaurant.
  const [allLocations, allCuisines] = await Promise.all([
    Location.find().exec(),
    Cuisine.find().exec(),
  ]);

  res.render("pages/restaurant_form", {
    title: "Create Restaurant",
    locations: allLocations,
    cuisines: allCuisines,
  });
});


// Handle restaurant create on POST.
exports.restaurant_create_post = [
  // Convert the location to an array.
  (req, res, next) => {
    if (!(req.body.location instanceof Array)) {
      if (typeof req.body.location === "undefined") req.body.location = [];
      else req.body.location = new Array(req.body.location);
    }
    next();
  },
  // Convert the cuisine to an array.
  (req, res, next) => {
    if (!(req.body.cuisine instanceof Array)) {
      if (typeof req.body.cuisine === "undefined") req.body.cuisine = [];
      else req.body.cuisine = new Array(req.body.cuisine);
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    //.escape(),
  body("location.*", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    //.escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 3 }),
    //.escape(),
  body("cuisine.*"),
    //.escape(),
  
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    let errors = validationResult(req);
    errors = errors.array();

    // If cuisine is not defined, not an array, or has no elements, it's invalid.
    if (!req.body.cuisine || !Array.isArray(req.body.cuisine) || req.body.cuisine.length === 0) {
      errors = [...errors, { msg: 'Select at least one cuisine.' }];
    }

    // Create a Restaurant object with escaped and trimmed data.
    const restaurant = new Restaurant({
      name: req.body.name,
      location: req.body.location,
      cuisine: req.body.cuisine,
      summary: req.body.summary,
    });

    if (errors.length > 0) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all locations and cuisines for form.
      const [allLocations, allCuisines] = await Promise.all([
        Location.find().exec(),
        Cuisine.find().exec(),
      ]);

      // Mark our selected cuisines as checked.
      for (const cuisine of allCuisines) {
        if (restaurant.cuisine.includes(cuisine._id)) {
          cuisine.checked = "true";
        }
      }

      res.render("pages/restaurant_form", {
        title: "Create Restaurant",
        restaurant: restaurant,
        locations: allLocations,
        cuisines: allCuisines,
        errors: errors,
      });
    } else {
      // Data from form is valid. Save restaurant.
      await restaurant.save();
      res.redirect(restaurant.url);
    }
  }),
];


// Display restaurant delete form on GET.
exports.restaurant_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of restaurant and all its restaurant instances (in parallel)
  const [restaurant, allRestaurantInstancesOfRestaurant] = await Promise.all([
    Restaurant.findById(req.params.id).populate("location").populate("cuisine").exec(),
    RestaurantInstance.find({ restaurant: req.params.id }).populate("restaurant").populate("location").exec(),
  ]);

  if (restaurant === null) {
    // No results.
    res.redirect("/restaurants");
  }

  res.render("pages/restaurant_delete", {
    title: "Delete Restaurant",
    restaurant: restaurant,
    restaurant_instances: allRestaurantInstancesOfRestaurant,
  });
});


// Handle restaurant delete on POST.
exports.restaurant_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of restaurant and all its restaurant instances (in parallel)
  const [restaurant, allRestaurantInstancesOfRestaurant] = await Promise.all([
    Restaurant.findById(req.params.id).populate("location").populate("cuisine").exec(),
    RestaurantInstance.find({ restaurant: req.params.id }).exec(),
  ]);

  if (allRestaurantInstancesOfRestaurant.length > 0) {
    // restaurant has restaurant instances. Render in same way as for GET route.
    res.render("pages/restaurant_delete", {
      title: "Delete Restaurant",
      restaurant: restaurant,
      restaurant_instances: allRestaurantInstancesOfRestaurant,
    });
    return;
  } else {
    // restaurant has no restaurant instances. Delete object and redirect to the list of restaurants.
    await Restaurant.findByIdAndDelete(req.body.restaurantid);
    res.redirect("/restaurants");
  }
});


// Display restaurant update form on GET.
exports.restaurant_update_get = asyncHandler(async (req, res, next) => {
  // Get restaurant, locations and cuisines for form.
  const [restaurant, allLocations, allCuisines] = await Promise.all([
    Restaurant.findById(req.params.id).populate("location").populate("cuisine").exec(),
    Location.find().exec(),
    Cuisine.find().exec(),
  ]);

  if (restaurant === null) {
    // No results.
    const err = new Error("Restaurant not found");
    err.status = 404;
    return next(err);
  }

  // Mark our selected cuisines as checked.
  for (const cuisine of allCuisines) {
    for (const restaurant_c of restaurant.cuisine) {
      if (cuisine._id.toString() === restaurant_c._id.toString()) {
        cuisine.checked = "true";
      }
    }
  }

  res.render("pages/restaurant_form", {
    title: "Update Restaurant",
    locations: allLocations,
    cuisines: allCuisines,
    restaurant: restaurant,
  });
});


// Handle restaurant update on POST.
exports.restaurant_update_post = [

  // Convert the location to an array.
  (req, res, next) => {
    if (!(req.body.location instanceof Array)) {
      if (typeof req.body.location === "undefined") {
        req.body.location = [];
      } else {
        req.body.location = new Array(req.body.location);
      }
    }
    next();
  },
  // Convert the cuisine to an array.
  (req, res, next) => {
    if (!(req.body.cuisine instanceof Array)) {
      if (typeof req.body.cuisine === "undefined") {
        req.body.cuisine = [];
      } else {
        req.body.cuisine = new Array(req.body.cuisine);
      }
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    //.escape(),
  body("location.*", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 }),
    //.escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 3 }),
    //.escape(),
  body("cuisine.*"),
    //.escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    let errors = validationResult(req);
    errors = errors.array();

    // If cuisine is not defined, not an array, or has no elements, it's invalid.
    if (!req.body.cuisine || !Array.isArray(req.body.cuisine) || req.body.cuisine.length === 0) {
      errors = [...errors, { msg: 'Select at least one cuisine.' }];
    }

    // Create a Restaurant object with escaped/trimmed data and old id.
    const restaurant = new Restaurant({
      name: req.body.name,
      location: typeof req.body.location === "undefined" ? [] : req.body.location,
      cuisine: typeof req.body.cuisine === "undefined" ? [] : req.body.cuisine,
      summary: req.body.summary,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (errors.length > 0) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all locations and cuisines for form.
      const [allLocations, allCuisines] = await Promise.all([
        Location.find().exec(),
        Cuisine.find().exec(),
      ]);

      // Mark our selected cuisines as checked.
      for (const cuisine of allCuisines) {
        if (restaurant.cuisine.includes(cuisine._id)) {
          cuisine.checked = "true";
        }
      }

      res.render("pages/restaurant_form", {
        title: "Update Restaurant",
        restaurant: restaurant,
        locations: allLocations,
        cuisines: allCuisines,
        errors: errors,
      });
    } else {
      // Data from form is valid. Update the record.
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, restaurant, {});
      // Redirect to restaurant detail page.
      res.redirect(updatedRestaurant.url);
    }
  }),
];
