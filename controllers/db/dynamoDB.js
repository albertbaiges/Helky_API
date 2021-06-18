
const config = {
    region: process.env.region,
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey
    }
}

const JDyn = require("../../libs/jdyn")
const jdyn = new JDyn(config);



module.exports = {
    jdyn
}