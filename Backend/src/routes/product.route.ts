import { Router } from "express";

import { isSellerAuthenticated } from "../middleware/seller.middleware.js";

const productRouter = Router();

productRouter.post("/create-product", isSellerAuthenticated);

export default productRouter;
