
const express = require("express");
const router = express.Router();
const { searchesController } = require("../../controllers");

router.get("", async (req, res) => {
    const data = await searchesController.getUsers(req.query);
    let response;
    if(data) {
        response = {users: data};
    } else {
        response = {error: "No users matched the filter"}
    }
    res.json(response)
    console.log(response)
});



module.exports = router;