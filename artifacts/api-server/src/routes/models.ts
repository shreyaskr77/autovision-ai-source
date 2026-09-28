import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/v1/models", (_request, response) => {
  response.json({
    detector: "unavailable",
    classifier: "unavailable",
    colour_estimator: "ready",
    ready: false,
    message:
      "Add the configured vehicle detector and make/model classifier weights to enable recognition. Colour preprocessing is available.",
  });
});

export default router;