import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: true
        }
    }
});

// *** User Schema Methods ***
/**
 * Add new product item to user's cart
 * @param {string} productId The ID of the product to be added to the cart.
 * @returns {User} This user after new product is added to own cart .
 */
userSchema.methods.addToCart = function (productId) {
    const itemIndex = this.cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    let cartItems = this.cart.items;
    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity += 1;
    } else {
        cartItems.push({ product: productId, quantity: 1 });
    }
    this.cart.items = cartItems;
    return this;
};

/**
 * Delete a product item from user's cart
 * @param {string} productId The ID of the product to be deleted from the cart.
 * @returns {User} This user after delete a cart item.
 */
userSchema.methods.deleteCartItem = function (productId) {
    const updatedCartItems = this.cart.items.filter(
        (item) => item.product.toString() !== productId
    );
    this.cart.items = [...updatedCartItems];

    return this;
};

export default model("User", userSchema);
