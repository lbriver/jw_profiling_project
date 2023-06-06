import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  // console.log(req.body);
  return res.render("main");
});

export default router;
