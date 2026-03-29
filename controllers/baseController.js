const utilities = require("../utilities")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    res.render("index", { title: "Home", nav })
}

baseController.triggerError = async function (req, res, next) {
    throw new Error("Intentional Error 500")
}

module.exports = baseController