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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationSelect,
        errors: null
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

// Build the add inventory view
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error ("No data returned"))
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
     const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    const inventoryData = await invModel.getInventoryByInventoryId(inv_id)
    const classificationSelect = await utilities.buildClassificationList(inventoryData.classification_id)
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_description: inventoryData.inv_description,
        inv_image: inventoryData.inv_image,
        inv_thumbnail: inventoryData.inv_thumbnail,
        inv_price: inventoryData.inv_price,
        inv_miles: inventoryData.inv_miles,
        inv_color: inventoryData.inv_color,
        classification_id: inventoryData.classification_id
    })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
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

    const updateResult = await invModel.updateInventory(
        inv_id,
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

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit" + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
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
        })
    }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
     const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    const inventoryData = await invModel.getInventoryByInventoryId(inv_id)
    // const classificationSelect = await utilities.buildClassificationList(inventoryData.classification_id)
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_price: inventoryData.inv_price,
        
    })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventoryData = async function (req, res, next) {
    const nav = await utilities.getNav()
    const { inv_id } = req.body
    const deleteResult = await invModel.deleteInventory(inv_id)

    if (deleteResult) {
        req.flash("notice", "The vehicle was successfully deleted.")
        res.redirect("/inv/")
    } else {
        req.flash("notice", "Sorry, the delete failed.")
        res.redirect("inventory/delete-confirm/inv_id", {
            title: "Delete Inventory Item",
            nav,
            errors: null
        })
    }
}


module.exports = invCont