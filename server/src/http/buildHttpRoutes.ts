import { Router, static as static_ } from "express";

export default function buildHttpRoutes() {
  const router = Router();

  // serve html file in root/public
  router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
  });

  // serve static files
  router.use(static_("public"));

  router.get("/api/env", (req, res) => {
    res.json({ isProduction: process.env.NODE_ENV === "production" });
  });

  return router;
}
