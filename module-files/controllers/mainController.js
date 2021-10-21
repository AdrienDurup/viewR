
const { ViewR } = require("../core/viewr");
const viewr = new ViewR();
const users = require("../data/sampleData.json");

/* Routes logic */
module.exports = {
    log: (req, res, next) => {
        console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
        next();
    },

    root: (req, res) => {

        res.status(200).send(viewr.render("views/index",
            {
                card: users[0],
                cards: users,
            }));
    },
    outerinner: (req, res) => {
        let toggle = true;
        if (req.query.toggleVar === "true") {
            toggle = true;
        } else if (req.query.toggleVar === "false") {
            toggle = false;
        };
        res.status(200).send(viewr.render("views/outerinner",
            {
                card: users[0],
                toggle
            }));
    },
    loop: (req, res) => {
        res.status(200).send(viewr.render("views/loop",
            {
                cards: users,
            }));
    },
    component: (req, res) => {
        res.status(200).send(viewr.render("views/component", {}));
    },
    componentQueryResult:(req, res)=>{
        let test = req.query.msg;
        test += " wolrd";
        res.status(200).send(test);
    },
    test: (req, res) => {
        res.status(200).json({ searchLabel:" Search",button:"Go !"});
    },

    /*  */
    session: (req, res) => {

    },

}