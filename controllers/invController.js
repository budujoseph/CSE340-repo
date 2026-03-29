const invModel = require("../models/inventory-model")
const utilities = require("../utilities") 

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}


/* **************************************
* Build detail view of vehicles
* ************************************ */
invCont.buildByInventoryId = async function (req, res, next) {
    try {
        const inventory_id = req.params.inventoryId
        const data = await invModel.getInventoryByInventoryId(inventory_id)
        if (!data) {
            const err = new Error("Vehicle not found")
            err.status = 404
            throw err
        }
        let nav = await utilities.getNav()
        let detail = await utilities.buildVehicleDetail(data)
  
        res.render("./inventory/detail", {
            title: data.inv_make + " " + data.inv_model,
            nav,
            detail
        })
    } catch (error) {
        next(error)
    }
    
}

invCont.buildManagement = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
    })
}

invCont.buildAddClassification = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}

invCont.addNewClassification = async function (req, res) {
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    
    const clResult = await invModel.addNewClassification(classification_name)

    if (clResult) {
        req.flash("notice", "Classification added sucessfully")
        res.status(201).render("inventory/management", {
            title: "Add Classification",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Failed to add vehicle")
        res.status(501).render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            classification_name,
            errors: null
        })
    }
}

invCont.buildAddInventory = async function(req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null
    })
}
 invCont.addNewInventory = async function (req, res) {
    let nav = await utilities.getNav()
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
     } = req.body
     

    const invResult = await invModel.addNewInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    )

    if (invResult) {
        req.flash("notice", "Inventory item added successfully")
        res.status(201).render("inventory/management", {
            title: "Add Inventory",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Failed to add inventory item")
        res.status(501).render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            errors: null
        })
    }
}


module.exports = invCont