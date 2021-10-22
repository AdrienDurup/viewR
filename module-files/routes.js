const xpr=require("express");
const router=xpr.Router();
const routeLogic=require("./controllers/mainController");

// router.use(xpr.json());
// router.use(xpr.urlencoded({extended:true}));

/* on définit les routes statiques */
router.use(xpr.static("assets"));
router.use(routeLogic.log);
router.get("/", routeLogic.root);
router.get("/test", routeLogic.test);
router.get("/outerinner", routeLogic.outerinner);
router.get("/loop", routeLogic.loop);
router.get("/component", routeLogic.component);
router.get("/msg", routeLogic.test);
module.exports=router;