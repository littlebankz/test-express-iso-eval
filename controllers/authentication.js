const moment = require('moment')
const crypto = require('crypto')
const mysql = require('mysql')
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

db.connect();
// @desc    Check given credential and provide authToken if credential is valid
// @route   GET /api/login
// @access  Public
exports.checkCredential = (req, res, next) => {

    // Get username and password from request body
    const { username, password } = req.body
    
    // Check for credential in sql database and also pull token from token table if exist
    let sql = `SELECT 
        users.id, 
        users.username, 
        users.password, 
        users.role, 
        tokens.token, 
        tokens.created 
    FROM users LEFT JOIN tokens ON 
        users.username = tokens.username 
    WHERE 
        users.username = ? AND 
        users.password = ?`;
    db.query(sql, [username, password], (error, result) => {
        if (error) throw error;

        // console.log('Result');
        // console.log(result);

        // If credential is valid 
        if (result.length == 1) {

            const { id, username, role, token, created } = result[0]
            let generatedToken = crypto.randomBytes(64).toString('base64');
            let todayDate = moment().format();

            // If token == null -> generate new token and insert into token table
            // If token != null -> check for expiry date
            if (token == null) {
                let sql = `INSERT INTO tokens (username, token, created) VALUES (?, ?, ?)`;
                db.query(sql, [username, generatedToken, todayDate], (error) => {
                    if (error) throw error;
                    let ret = {
                        username: username,
                        authToken: generatedToken,
                    }
                    console.log('Insert 1 new token.')
                    res.send(ret)
                    return
                })
            } else if (token != null) {
                // If (today) is after (created date +30 days) -> Expired
                let expired = moment(created).add(30, 'days')
                if (moment().isAfter(expired)) {
                    // Expired -> Renew authToken
                    let sql = `UPDATE tokens SET tokens.token = ?, tokens.created = ?`;
                    db.query(sql, [generatedToken, todayDate], (error, result) => {
                        if (error) throw error;
                        let ret = {
                            username: username,
                            authToken: generatedToken,
                        }
                        console.log('Renew 1 new token.')
                        res.send(ret)
                        return
                    })
                } else {
                    // Not Expired -> Return old token
                    let ret = {
                        username: username,
                        authToken: token,
                    }
                    console.log('1 Old token retreived')
                    res.send(ret)
                    return
                }
            }
        } else {
            res.send({});
        }
    })
}

// @desc    Validate authToken with username given
// @route   GET /api/login/authtoken
// @access  Public
exports.checkAuthToken = (req, res, next) => {
    const { username, token } = req.body;

    let sql = `SELECT tokens.token, tokens.created FROM tokens WHERE username = ?`;
    db.query(sql, [username], (error, result) => {
        if (error) throw error;

        let isValid = false
        if (result.length == 1) {
            if (token == result[0].token) {
                let expired = moment(result[0].created).add(30, 'days')
                if (moment().isAfter(expired)) {
                    isValid = false
                } else {
                    isValid = true
                }
            } else {
                isValid = false
            }
        } else {
            isValid = false
        }

        res.send({isValid})
        console.log(isValid)
    })
}