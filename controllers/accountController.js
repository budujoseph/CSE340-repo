const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    
    //Hashing password before storing
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing registration.")
        res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null
    })
   
    }
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Sorry, registeration failed.")
        res.status(501).render("account/register", {
            title: "Registeration",
            nav,
            errors: null
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        return
    }
    try {
        // console.log("Entered password:", account_password)
        // console.log("Stored hash:", accountData.account_password)
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, {httpOnly :true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, {httpOnly :true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect("/account/")
        } else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email
            })
        }
    } catch (error) {
        throw new Error(error)
    }
}

async function buildAccount(req, res) {
    let nav = await utilities.getNav()
    res.render("account/account-management", {   
        title: "My Account",
        nav,
        errors: null
    })
}

/* ****************************************
 *  JWT token to check account type and allow certain privilages
 * ************************************ */
async function checkJwtToken(req, res, next) {
    const token = req.cookies.jwt

    if(!token) {
        req.flash("notice", "Please log in to access that page.")
        return res.redirect("/account/login")
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.accountData = decoded

        res.locals.accountData = decoded
        next()
    } catch (error) {
        req.flash("notice", "Session expired. Please log in again.")
        return res.redirect("/account/login")
    }
}

async function buildUpdateAccount(req, res) {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)

    res.render("account/update-view", {
        title: "Update Account",
        nav,
        errors: null,
        accountData
    })
}

async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    try {
        const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

        if (updateResult) {
            req.flash("notice", "Account information updated successfully.")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Failed to update account information.")
            res.redirect("/account/update-view/" + account_id)
        }
    } catch (error) {
        console.error("Update account error:", error)
        req.flash("notice", "An error occurred while updating your account.")
        res.redirect("/account/update-view/" + account_id)
    }
}

async function updatePassword(req, res) {
    const { account_id, account_password } = req.body
    
    try {
        const hashedPassword = await bcrypt.hashSync(account_password, 10)
        const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
        if (updateResult) {
            req.flash("notice", "Password updated successfully.")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Failed to update password.")
            res.redirect("/account/update-view/" + account_id)
        }
    } catch (error) {
        throw new Error(error)  
    }
}

async function accountLogout(req, res) {
    res.clearCookie("jwt")
    // req.flash("notice", "You have been logged out.")
    return res.redirect("/")
}

// function to add favourite vehicle for the user
async function addToFavorites(req, res) {
    accountData = res.locals.accountData

        if (!accountData) {
            req.flash("notice", "Please log in to add items to favorites.")
            return res.redirect("/account/login")
        }
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body
    try {
        const existingFavorite = await accountModel.checkExistingFavorite(account_id, inv_id)
        if (existingFavorite > 0) {
            req.flash("notice", "Item is already in favorites.")
            return res.redirect("/account/add-favorite")
        }

        const favorites = await accountModel.addFavorite(account_id, inv_id)

        if (favorites) {
            req.flash("notice", "Item added to favorites.")
        } else {
            req.flash("notice", "Failed to add item to favorites.")
        } 
        return res.redirect("/account/add-favorite")


    } catch (error) {
        console.error("Add to favorites error:", error)
    }

}

// function to build the favorites view for the user
async function buildFavoritesView(req, res) {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id

    try {
        const favorites = await accountModel.getFavoritesByAccountId(account_id)
        res.render("account/add-favorite", {
            title: "My Favorites",
            nav,
            errors: null,
            favorites
        })
    } catch (error) {
        console.error("Build favorites view error:", error)
        req.flash("notice", "An error occurred while retrieving your favorites.")
        res.render("account/add-favorite", {
            title: "My Favorites",
            nav,
            errors: null,
            favorites: []
        })
    }
}

async function removeFromFavorites(req, res) {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body
    try {
        const removeResult = await accountModel.deleteFavorite(account_id, inv_id)
        if (removeResult) {
            req.flash("notice", "Item removed from favorites.")
            res.redirect("/account/add-favorite")
        } else {
            req.flash("notice", "Failed to remove item from favorites.")
            res.redirect("/account/add-favorite")
        }
    } catch (error) {
        console.error("Remove from favorites error:", error)
        req.flash("notice", "An error occurred while removing the item from favorites.")
        res.redirect("/account/add-favorite")
    }
}

// async function checkExistingFavorite(account_id, inv_id) {
//    try {
//        const account_id = res.locals.accountData.account_id
//        const {inv_id} = req.body
//        const existingFavorite = await accountModel.checkExistingFavorite(account_id, inv_id)
//        if(existingFavorite > 0) {
//            req.flash("notice", "Item is already in favorites.")
//            res.redirect("/account/add-favorite")
//        }
//    } catch (error) {
//          console.error("Check existing favorite error:", error)
//    } 
// }


module.exports = {
    buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, checkJwtToken,
    buildUpdateAccount, updateAccount, updatePassword, accountLogout, addToFavorites, buildFavoritesView,
    removeFromFavorites
}