const utilities = require("../utilities/index")
const inventoryModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Add classification rules
 * ********************************* */
validate.addClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Classification name is required")
            .bail()
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("No spaces or special characters allowed")
            .custom(async (classification_name) => {
                const clName = await inventoryModel.checkExistingClassification(classification_name)
                if (clName) {
                    throw new Error("Classification already exists!!")
                }
            }),
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
    }
    next()
}

validate.addInventoryRules = () => {
    return [
        body("classification_id")
            .trim()
            .notEmpty(),

        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Make is required")
            .bail()
            .matches(/^[A-Za-z0-9\s]+$/)
            .isLength({ min: 3 })
            .withMessage("Invalid make format"),
        
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Model is required")
            .bail()
            .matches(/^[A-Za-z0-9\s]+$/)
            .isLength({ min: 3 })
            .withMessage("Invalid model format"),
        
        body("inv_year")
            .trim()
            .notEmpty()
            .withMessage("Year is required")
            .bail()
            .isLength({ min: 4, max: 4 })
            .withMessage("Year must be 4 digits")
            .bail()
            .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
            .withMessage("Invalid year"),
        
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Description is required"),
        
        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Image path is required"),
        
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Thumbnail path is required"),
        
        body("inv_price")
            .trim()
            .notEmpty()
            .withMessage("Price is required")
            .bail()
            .isFloat({ min: 0 })
            .withMessage("Invalid price format"),
        
        body("inv_miles")
            .trim()
            .notEmpty()
            .withMessage("Miles is required")
            .bail()
            .isFloat({ min: 0 })
            .withMessage("Invalid miles format"),
        
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Color is required")
            .bail()
            .matches(/^[A-Za-z\s]+$/)
            .withMessage("Invalid color format"),
        
    ]
}

// Check the inventory data before adding an inventory item
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList()
        return res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
    }
    next()
}

// Check the inventory data before updating an inventory item
validate.checkUpdateData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,inv_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList()
        return res.render("inventory/edit-inventory", { // direct back to edit view if errors are found
            errors,
            title: "Edit " + inv_make + " " + inv_model,
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            inv_id
        })
    }
    next()
}


module.exports = validate