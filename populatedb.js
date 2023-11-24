#! /usr/bin/env node

console.log(
  'This script populates some test restaurants to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/halal_restaurants?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Restaurant = require("./models/restaurant");
const RestaurantInstance = require("./models/restaurantinstance");
const Location = require("./models/location");
const Cuisine = require("./models/cuisine");

const restaurants = [];
const restaurantinstances = [];
const locations = [];
const cuisines = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createLocations();
  await createCuisines();
  await createRestaurants();
  await createRestaurantInstances();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// location[0] will always be Raleigh, regardless of the order
// in which the elements of promise.all's argument complete.
async function locationCreate(index, city, state, country) {
  const locationdetail = { city: city, country: country };
  if (state != null) locationdetail.state = state;

  const location = new Location(locationdetail);
  await location.save();
  locations[index] = location;
  console.log(`Added location: ${city}, ${state}, ${country}`);
}

async function cuisineCreate(index, name) {
  const cuisine = new Cuisine({ name: name });
  await cuisine.save();
  cuisines[index] = cuisine;
  console.log(`Added cuisine: ${name}`);
}

async function restaurantCreate(index, name, location, cuisine, summary) {
  const restaurantdetail = {
    name: name,
    location: location,
    cuisine: cuisine 
  };
  if (summary != null) restaurantdetail.summary = summary;

  const restaurant = new Restaurant(restaurantdetail);
  await restaurant.save();
  restaurants[index] = restaurant;
  console.log(`Added restaurant: ${name}`);
}

async function restaurantInstanceCreate(index, restaurant, location, address, rating, price) {
  const restaurantinstancedetail = {
    restaurant: restaurant,
    location: location,
    address: address 
  };
  if (rating != null) restaurantinstancedetail.rating = rating;
  if (price != null) restaurantinstancedetail.price = price;

  const restaurantinstance = new RestaurantInstance(restaurantinstancedetail);
  await restaurantinstance.save();
  restaurantinstances[index] = restaurantinstance;
  console.log(`Added restaurantinstance: ${restaurant}`);
}

async function createLocations() {
  console.log("Adding locations");
  await Promise.all([
    locationCreate(0, "London", null, "United Kingdom"),
    locationCreate(1, "Karachi", null, "Pakistan"),
    locationCreate(2, "New York", null, "United States"),
    locationCreate(3, "Raleigh", "North Carolina", "United States"),
    locationCreate(4, "Los Angeles", "California", "United States"),
  ]);
}

async function createCuisines() {
  console.log("Adding cuisines");
  await Promise.all([
    cuisineCreate(0, "Indian"),
    cuisineCreate(1, "Pakistani"),
    cuisineCreate(2, "Arab"),
    cuisineCreate(3, "American"),
  ]);
}

async function createRestaurants() {
  console.log("Adding Restaurants");
  await Promise.all([
    restaurantCreate(0,
      "Dishoom",
      [locations[0]],
      [cuisines[0]],
      "Renowned for serving delicious, affordable Indian cuisine in beautifully atmospheric settings, the Dishoom restaurants need little introduction."
    ),
    restaurantCreate(1,
      "Kolachi",
      [locations[1]],
      [cuisines[1]],
      "Kolachi Restaurant is a true gem that effortlessly combines exceptional service, a captivating environment, and a symphony of flavors."
    ),
    restaurantCreate(2,
      "Adel's Famous Halal Food",
      [locations[2]],
      [cuisines[2]],
      "Adel's Famous Halal Food is the best halal cart in New York City! Serves chicken and lamb platters with rice."
    ),
    restaurantCreate(3,
      "Meat & Bite",
      [locations[3]],
      [cuisines[2], cuisines[3]],
      "Typical informal restaurant serving familiar comfort food, including pizza, burgers & burritos."
    ),
  ]);
}

async function createRestaurantInstances() {
  console.log("Adding restaurant instances");
  await Promise.all([
    restaurantInstanceCreate(0, 
      restaurants[0], 
      locations[0], 
      "22 Kingly St, Carnaby, London W1B 5QP, United Kingdom",
      4.6,
      "$$"
    ),
    restaurantInstanceCreate(1, 
      restaurants[0], 
      locations[0], 
      "5 Stable St, London N1C 4AB, United Kingdom",
      4.6,
      "$$"
    ),
    restaurantInstanceCreate(2, 
      restaurants[0], 
      locations[0], 
      "12 Upper St Martin's Ln, London WC2H 9FB, United Kingdom",
      4.5,
      "$$"
    ),
    restaurantInstanceCreate(3, 
      restaurants[0], 
      locations[0], 
      "4 Derry St, London W8 5SE, United Kingdom",
      4.7,
      "$$"
    ),
    restaurantInstanceCreate(4, 
      restaurants[1], 
      locations[1], 
      "Do Darya, Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone C Phase 8 Defence Housing Authority, Karachi, Karachi City, Sindh 75500, Pakistan",
      4.6,
      "$$$"
    ),
    restaurantInstanceCreate(4, 
      restaurants[2], 
      locations[2], 
      "1221 6th Ave, New York, NY 10020",
      4.4,
      "$"
    ),
    restaurantInstanceCreate(4, 
      restaurants[3], 
      locations[3], 
      "2908 Hillsborough St, Raleigh, NC 27607",
      4.8,
      "$$"
    ),
  ]);
}