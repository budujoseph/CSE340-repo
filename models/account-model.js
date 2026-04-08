const pool = require("../database/index")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account(account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found.")
    }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById(account_id) {
    try {
        const result = await pool.query(    
            "SELECT account_id, account_firstname, account_lastname, account_email, account_password FROM account WHERE account_id = $1",
            [account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching account found.")
    }
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email,) {
    try {
        const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    } catch (error) {
        return error.message
    }
}

async function updatePassword(account_id, account_password) {
    try {
        const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
        return await pool.query(sql, [account_password, account_id])
    } catch (error) {
        return error.message
    }
}

// Add a favorite inventory item for a user
async function addFavorite(account_id, inv_id) {
    try {
        const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
        return await pool.query(sql, [account_id, inv_id])
    } catch (error) {
        return error.message
    }
}
// Get favorites by account ID
async function getFavoritesByAccountId(account_id) {
    try {
        const sql = `SELECT i.* FROM public.favorites f
        JOIN inventory i ON f.inv_id = i.inv_id
        WHERE f.account_id = $1`
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        return error.message
    }
}

async function deleteFavorite(account_id, inv_id) {
    try {
        const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *"
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rows
    } catch (error) {
        return error.message
    }
}

async function checkExistingFavorite(account_id, inv_id) {
    try {
        const sql = "SELECT * FROM favorites WHERE account_id = $1 AND inv_id = $2 LIMIT 1"
        const favorite = await pool.query(sql, [account_id, inv_id])
        return favorite.rowCount
    } catch (error) {
        return error.message
    }
}

module.exports = {
    registerAccount, checkExistingEmail, getAccountByEmail, getAccountById,
    updateAccount, updatePassword, addFavorite, getFavoritesByAccountId, deleteFavorite, checkExistingFavorite
}