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

module.exports = invCont