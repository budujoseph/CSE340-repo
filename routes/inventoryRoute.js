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

module.exports = router;