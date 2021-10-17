
const viewr = require("../core/viewr");
const users= require("../data/sampleData.json");

/* Routes logic */
module.exports = {
    log: (req, res, next) => {
        console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
        next();
    },

    root: (req, res) => {

            res.status(200).send(viewr.render("views/index",
                {
                    card:users[0],
                    cards:users,
                }));
        },
        outerinner:(res)=>{

        },
        loop:()=>{

        },
        component:()=>{

        },

    /*  */
    session: (req, res) => {

    },

}