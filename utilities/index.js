const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += 
            '<a href= "/inv/type/' +
            row.classification_id +
            '" title= "See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })

    list += "</ul>"
    return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

Util.handleErrors = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)


module.exports = Util


/* **************************************
* Build the classification view HTML
* ************************************ */

Util.buildClassificationGrid = async function (data){
    let grid = ""
    if (data.length > 0) {
        grid = '<ul id= "inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id + '" ' +
                    ' title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
                    '<img src="' + vehicle.inv_thumbnail + '" ' +
                    'alt="' + vehicle.inv_make + ' ' + vehicle.inv_model + '">' +
                    '</a>'
            grid += '<div class="namePrice">'
            grid += '<hr>'
            grid += '<h2>'
            grid += '<a href= "/inv/detail/' + vehicle.inv_id + '" title="View '
                    + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                    + vehicle.inv_make + ' ' +vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                    + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })

        grid += '</ul>'
    } else {
        grid += '<p class= "notice">Sorry, no matching vehicles could be found </p>'
    }
    return grid
}


/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
    let detail = ""
    if (vehicle) {
        detail += '<div class= "vehicle-detail">'

        detail += '<div class="detail-img">' +
          '<img src="' + vehicle.inv_image + '" ' +
          'alt="' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" ' +
          ' title="Details of ' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '">' +
          '</div>';
        
        detail += '<div class= "detail-info">' + 
        '<h2 title= "Details of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '">' + vehicle.inv_year + ' ' + vehicle.inv_make
        + ' ' + vehicle.inv_model + " details" + 
        '</h2>'
        
        detail += '<p title= "Price of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '"><strong>Price: </strong> $'
        + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + '</p>'
        
        detail += '<p title= "Description of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '"><strong>Description: </strong>'
        + vehicle.inv_description + '</p>'
        
        detail += '<p title= "Color of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '"><strong>Color: </strong>'
        + vehicle.inv_color  + '</p>'
        
        detail += '<p title= "Mileage of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '"><strong>Miles: </strong>'
        + new Intl.NumberFormat("en-US").format(vehicle.inv_miles) + '</p>' + '</div>'
        
        detail += '</div>'
    } else {
        detail += '<p class= "notice">Sorry, vehicle not found.</p>'
    }

    return detail
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = 
    '<select name= "classification_id" id ="classificationList" required>'
    classificationList += "<option value =''>Choose a classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value = "' + row.classification_id + '"'

        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}