// Needed REesources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const classificationValidate = require("../utilities/classification-validation")
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get("/", utilities.handleErrors(invController.buildManagement))

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification", 
    classificationValidate.addClassificationRules(),
    classificationValidate.checkClassificationData,
    utilities.handleErrors(invController.addNewClassification)
)

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory",
    classificationValidate.addInventoryRules(),
    classificationValidate.checkInventoryData,
    utilities.handleErrors(invController.addNewInventory)
)

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Edit and Delete routes for inventory items
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory))

// Post route to update inventory item in database after editing
router.post("/edit/:inventory_id",
    classificationValidate.addInventoryRules(),
    classificationValidate.checkInventoryData,
   // utilities.handleErrors(invController.updateInventory)
)

// Route to direct incoming updates to the controller
router.post("/update/", utilities.handleErrors(invController.updateInventory))

// Route to direct incoming delete requests to the controller
router.get("/delete/:inventory_id", utilities.handleErrors(invController.deleteInventory))

router.post("/delete/", utilities.handleErrors(invController.deleteInventoryData))

module.exports = router;