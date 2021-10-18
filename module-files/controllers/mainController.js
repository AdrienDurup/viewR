
const {ViewR} = require("../core/viewr");
const viewr=new ViewR();
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
        outerinner:(req,res)=>{
            res.status(200).send(viewr.render("views/outerinner",
                {
                    card:users[0],
                }));
        },
        loop:(req,res)=>{
            res.status(200).send(viewr.render("views/loop",
                {
                    cards:users,
                }));
        },
        component:(req,res)=>{

        },

    /*  */
    session: (req, res) => {

    },

}