const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post("/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

router.post("/login", 
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

router.get("/update-view/:account_id", utilities.handleErrors(accountController.buildUpdateAccount))

router.post("/update-view",
    utilities.handleErrors(accountController.updateAccount),
)

router.post("/update-password",
    utilities.handleErrors(accountController.updatePassword),
)

router.get("/logout", utilities.handleErrors(accountController.accountLogout))


module.exports = router
