const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("First name is required")
            .bail()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name"),
    
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Last name is required")
            .bail()
            .isLength({ min: 2 })
            .withMessage("Please provide last name"),
    
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use a different email")
                }
            }),
        
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .bail()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements")
    ]
 
}

validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required"),
        
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .bail()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not match")

    ]
}

validate.checkLoginData = async (req, res, next) => {
    const {account_email} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
    }
    next()
}


 
module.exports = validate