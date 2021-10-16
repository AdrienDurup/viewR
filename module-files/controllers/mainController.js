
const viewr = require("../core/viewr");


/* Routes logic */
module.exports = {
    log: (req, res, next) => {
        console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
        next();
    },

    root: (req, res) => {

            res.status(200).send(viewr.render("views/index",
                {
                    startCard: {
                        newSession: "Nouvelle Partie",
                        indexButton: "Créer"
                    }
                }));
        },

    /*  */
    session: (req, res) => {

    },

}