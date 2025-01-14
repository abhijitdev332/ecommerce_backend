import { cartModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { infoResponse, successResponse } from "../utils/apiResponse.js";
async function createCart(req, res, next) {
  const { userId,cartTotal,products=[] } = req.body;
  const hadCart = await cartModel.find({userId});

  if (hadCart?.length>0) {
    return infoResponse(res, 400, "Cart already existed",hadCart);
  }
  const newCart = new cartModel({ userId,cartTotal,products });
  let savedCart = await newCart.save();
  if (!savedCart) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(
    res,
    201,
    "Cart Created Successfully",
    savedCart
  );
}
async function getCart(req, res, next) {
  const { id } = req.params;

  const matchedCart = await cartModel.find({userId:id});
  if (!matchedCart) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }

  return successResponse(res, 200, "sucessfull", matchedCart);
}
async function updateCart(req, res, next) {
  const { id} = req.params;
  const { cartTotal,products=[] } = req.body;

  const updatedCart = await cartModel.findOneAndUpdate({userId:id},
    {cartTotal,products },
    {
      runValidators: true,
    }
  );
  if (!updatedCart) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "Cart updated successfully");
}
async function deleteCart(req, res, next) {
  const { id } = req.params;
  const deletedCart = await cartModel.findOneAndDelete({userId:id});
  if (!deletedCart) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "product variant Deleted");
}
async function addProductInCart(req,res,next){
  const {id}=req.params
  const { cartTotal,product } = req.body;
  const cart=await cartModel.find({userId:id})

  cart?.products?.push({...product})
  await cart.save()
  // update carttotal
  let updCart=await cartModel.findOneAndUpdate({userId:id},{
    cartTotal
  })
  if(!updCart){
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }
  
  return successResponse(res, 200, "Cart updated successfully");
}
async function removeProductInCart(req,res,next){
  const {id}=req.params
  const { productId,variantId } = req.body;
  const cart=await cartModel.find({userId:id})
if(!cart){
  return infoResponse(res,400,"can't find the cart")
}
  let inx=cart.products.find(ele=>ele?.productId==productId&&ele?.variantId==variantId)

  cart?.products?.splice(inx,1)
  await cart.save()

  return successResponse(res,200,"Product deleted Successfull")
}

export { createCart, getCart, updateCart, deleteCart,addProductInCart,removeProductInCart };
