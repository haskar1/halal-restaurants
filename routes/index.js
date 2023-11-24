const express = require('express');
const router = express.Router();

// Require controller modules.
const restaurant_controller = require("../controllers/restaurantController");
const location_controller = require("../controllers/locationController");
const cuisine_controller = require("../controllers/cuisineController");
const restaurant_instance_controller = require("../controllers/restaurantinstanceController");


/// RESTAURANT ROUTES ///

// GET home page.
router.get("/", restaurant_controller.index);

// GET request for creating a restaurant. NOTE This must come before routes that display restaurant (uses id).
router.get("/restaurant/create", restaurant_controller.restaurant_create_get);

// POST request for creating restaurant.
router.post("/restaurant/create", restaurant_controller.restaurant_create_post);

// GET request to delete restaurant.
router.get("/restaurant/:id/delete", restaurant_controller.restaurant_delete_get);

// POST request to delete restaurant.
router.post("/restaurant/:id/delete", restaurant_controller.restaurant_delete_post);

// GET request to update restaurant.
router.get("/restaurant/:id/update", restaurant_controller.restaurant_update_get);

// POST request to update restaurant.
router.post("/restaurant/:id/update", restaurant_controller.restaurant_update_post);

// GET request for one restaurant.
router.get("/restaurant/:id", restaurant_controller.restaurant_detail);

// GET request for list of all restaurant items.
router.get("/restaurants", restaurant_controller.restaurant_list);



/// LOCATION ROUTES ///

// GET request for creating location. NOTE This must come before route for id (i.e. display location).
router.get("/location/create", location_controller.location_create_get);

// POST request for creating location.
router.post("/location/create", location_controller.location_create_post);

// GET request to delete location.
router.get("/location/:id/delete", location_controller.location_delete_get);

// POST request to delete location.
router.post("/location/:id/delete", location_controller.location_delete_post);

// GET request to update location.
router.get("/location/:id/update", location_controller.location_update_get);

// POST request to update location.
router.post("/location/:id/update", location_controller.location_update_post);

// GET request for one location.
router.get("/location/:id", location_controller.location_detail);

// GET request for list of all locations.
router.get("/locations", location_controller.location_list);



/// CUISINE ROUTES ///

// GET request for creating a cuisine. NOTE This must come before route that displays cuisine (uses id).
router.get("/cuisine/create", cuisine_controller.cuisine_create_get);

//POST request for creating cuisine.
router.post("/cuisine/create", cuisine_controller.cuisine_create_post);

// GET request to delete cuisine.
router.get("/cuisine/:id/delete", cuisine_controller.cuisine_delete_get);

// POST request to delete cuisine.
router.post("/cuisine/:id/delete", cuisine_controller.cuisine_delete_post);

// GET request to update cuisine.
router.get("/cuisine/:id/update", cuisine_controller.cuisine_update_get);

// POST request to update cuisine.
router.post("/cuisine/:id/update", cuisine_controller.cuisine_update_post);

// GET request for one cuisine.
router.get("/cuisine/:id", cuisine_controller.cuisine_detail);

// GET request for list of all cuisine.
router.get("/cuisines", cuisine_controller.cuisine_list);



/// RESTAURANTINSTANCE ROUTES ///

// GET request for creating a restaurantinstance. NOTE This must come before route that displays restaurantinstance (uses id).
router.get(
  "/restaurantinstance/create",
  restaurant_instance_controller.restaurantinstance_create_get,
);

// POST request for creating restaurantinstance.
router.post(
  "/restaurantinstance/create",
  restaurant_instance_controller.restaurantinstance_create_post,
);

// GET request to delete restaurantinstance.
router.get(
  "/restaurantinstance/:id/delete",
  restaurant_instance_controller.restaurantinstance_delete_get,
);

// POST request to delete restaurantinstance.
router.post(
  "/restaurantinstance/:id/delete",
  restaurant_instance_controller.restaurantinstance_delete_post,
);

// GET request to update restaurantinstance.
router.get(
  "/restaurantinstance/:id/update",
  restaurant_instance_controller.restaurantinstance_update_get,
);

// POST request to update restaurantinstance.
router.post(
  "/restaurantinstance/:id/update",
  restaurant_instance_controller.restaurantinstance_update_post,
);

// GET request for one restaurantinstance.
router.get("/restaurantinstance/:id", restaurant_instance_controller.restaurantinstance_detail);

// GET request for list of all restaurantinstance.
router.get("/restaurantinstances", restaurant_instance_controller.restaurantinstance_list);

module.exports = router;
