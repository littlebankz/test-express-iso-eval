const express = require("express");
const router = express.Router();
const {
  checkCredential,
  checkAuthToken,
  deleteAuthToken,
} = require("../controllers/authentication");

router.route("/").post(checkCredential);

router.route("/").delete(deleteAuthToken);

router.route("/authtoken").post(checkAuthToken);

module.exports = router;
