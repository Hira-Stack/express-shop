import { ObjectId } from "mongodb";

import { getDb } from "../util/database.js";
import Product from "./product.js";
import CartItem from "./cart-item.js";

class Cart {
    constructor(items = [], totalPrice = 0.0) {
        this.items = items;
        this.totalPrice = totalPrice;
    }

    /**
     * Add new product item to user's cart
     * @param {string} productId The ID of the product to be added to the cart.
     * @returns {Promise} The cart after new product is added.
     */
    addProduct(productId) {
        const itemIndex = this.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex !== -1) {
            this.items[itemIndex].quantity += 1;
            return Promise.resolve(this);
        } else {
            return Product.findById(productId)
                .then((product) => {
                    const cartItem = new CartItem(
                        product._id,
                        product.title,
                        product.price,
                        1
                    );
                    this.items.push(cartItem);
                    return this;
                })
                .catch((err) => {
                    throw new Error(err);
                });
        }
    }

    /**
     * Delete a product item from user's cart
     * @param {string} productId The ID of the product to be deleted from the cart.
     * @returns {Cart} This cart.
     */
    deleteItem(productId) {
        const updatedItems = this.items.filter(
            (item) => item.productId.toString() !== productId
        );
        this.items = updatedItems;

        return this;
    }

    /**
     *  Update items of user's cart
     * @param {string} userId The user ID that owns this cart.
     * @returns {Promise} Result of update user's document in database.
     */
    updateByUserId(userId) {
        const db = getDb();
        const usersCollection = db.collection("users");

        // Update the "totalPrice" value before updating the database
        this.items.forEach((item) => {
            this.totalPrice += item.quantity * item.price;
        });
        this.totalPrice = +this.totalPrice.toFixed(2);

        return usersCollection
            .updateOne(
                {
                    _id: ObjectId.createFromHexString(userId)
                },
                {
                    $set: {
                        cart: this
                    }
                }
            )
            .then((result) => result)
            .catch((err) => {
                throw new Error(err);
            });
    }
}

export default Cart;
