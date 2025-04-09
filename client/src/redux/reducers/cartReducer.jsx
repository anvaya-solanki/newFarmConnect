import { ADD_TO_CART, DEC_QTY_IN_CART, INC_QTY_IN_CART, REMOVE_ALL_FROM_CART, REMOVE_FROM_CART } from "../constants";

let initialState = [];

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      // Check if product already exists in cart
      const existingProductIndex = state.findIndex(item => item._id === action.payload._id);
      
      // If product exists, update quantity and price
      if (existingProductIndex >= 0) {
        return state.map((item, index) => {
          if (index === existingProductIndex) {
            const newQty = Number(item.qty) + Number(action.payload.qty);
            const pricePerUnit = Number(item.pricePerUnit);
            const newPrice = pricePerUnit * newQty;
            
            // Validate calculations
            if (isNaN(newQty) || isNaN(pricePerUnit) || isNaN(newPrice)) {
              console.error("Invalid price calculation in cart:", {
                itemQty: item.qty,
                payloadQty: action.payload.qty,
                pricePerUnit: item.pricePerUnit,
                calculated: {
                  newQty,
                  pricePerUnit,
                  newPrice
                }
              });
              // Fall back to existing values if calculation fails
              return item;
            }
            
            return { 
              ...item, 
              qty: newQty, 
              currentPrice: newPrice,
              totalPrice: newPrice
            };
          }
          return item;
        });
      }
      
      // Check payload values are valid before adding to cart
      const payloadPrice = Number(action.payload.pricePerUnit);
      const payloadQty = Number(action.payload.qty);
      const calculatedPrice = payloadPrice * payloadQty;
      
      if (isNaN(payloadPrice) || isNaN(payloadQty) || isNaN(calculatedPrice)) {
        console.error("Invalid price in ADD_TO_CART payload:", action.payload);
        // Return state unchanged if values are invalid
        return state;
      }
      
      // Ensure price values are set correctly in the payload
      const validatedPayload = {
        ...action.payload,
        pricePerUnit: payloadPrice,
        qty: payloadQty,
        currentPrice: calculatedPrice,
        totalPrice: calculatedPrice
      };
      
      // If product doesn't exist, add it to cart
      return [...state, validatedPayload];
      
    case REMOVE_ALL_FROM_CART:
      return [];
      
    case REMOVE_FROM_CART:
      const productToRemove = action.payload;
      const updatedCart = state.filter((item) => item._id !== productToRemove);
      return updatedCart;
      
    case INC_QTY_IN_CART:
      const productIdToIncQty = action.payload;
      const updatedCartByIncQty = state.map((item) => {
        if (item._id === productIdToIncQty && Number(item.qty) !== Number(item.stocksLeft)) {
          const newQty = Number(item.qty) + 1;
          const pricePerUnit = Number(item.pricePerUnit);
          const newPrice = pricePerUnit * newQty;
          
          // Validate calculations
          if (isNaN(newQty) || isNaN(pricePerUnit) || isNaN(newPrice)) {
            console.error("Invalid price calculation in INC_QTY:", {
              item,
              calculated: {
                newQty,
                pricePerUnit,
                newPrice
              }
            });
            // Fall back to existing values if calculation fails
            return item;
          }
          
          return { 
            ...item, 
            qty: newQty, 
            currentPrice: newPrice,
            totalPrice: newPrice
          };
        }
        return item;
      });
      return updatedCartByIncQty;
      
    case DEC_QTY_IN_CART:
      const productIdToDecQty = action.payload;
      const updatedCartByDecQty = state.map((item) => {
        const minQty = Number(item.minimumOrderQuantity) || 1;
        if (item._id === productIdToDecQty && Number(item.qty) > minQty) {
          const newQty = Number(item.qty) - 1;
          const pricePerUnit = Number(item.pricePerUnit);
          const newPrice = pricePerUnit * newQty;
          
          // Validate calculations
          if (isNaN(newQty) || isNaN(pricePerUnit) || isNaN(newPrice)) {
            console.error("Invalid price calculation in DEC_QTY:", {
              item,
              calculated: {
                newQty,
                pricePerUnit,
                newPrice
              }
            });
            // Fall back to existing values if calculation fails
            return item;
          }
          
          return { 
            ...item, 
            qty: newQty, 
            currentPrice: newPrice,
            totalPrice: newPrice
          };
        }
        return item;
      });
      return updatedCartByDecQty;
      
    default:
      return state;
  }
};
