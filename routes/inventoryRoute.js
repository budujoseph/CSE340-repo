// Needed REesources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utitlities = require("../utilities/index")
router.get("/type/:classificationId", utitlities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", invController.buildByInventoryId);

module.exports = router;