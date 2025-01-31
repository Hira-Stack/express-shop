import { ObjectId } from "mongodb";

import { getDb } from "../util/database.js";

class Order {
    constructor(userId, items = [], totalPrice = 0.0) {
        this.userId = userId;
        this.items = items;
        this.totalPrice = totalPrice;
        this.date = new Date();
    }

    /**
     * Add new product item to user's cart
     * @param {boolean} editMode If true edit (update) an order else insert a new order.
     * @returns {Promise} The cart after adding new product.
     */
    save(editMode = false) {
        const db = getDb();
        const ordersCollection = db.collection("orders");

        if (editMode) {
            return ordersCollection.updateOne(
                { _id: this.id },
                {
                    $set: {
                        items: this.items,
                        totalPrice: this.totalPrice,
                        date: new Date()
                    }
                }
            );
        }
        return ordersCollection.insertOne(this);
    }

    /**
     * Add new product item to user's cart
     * @param {string} userId The ID of the user owns this found orders.
     * @returns {Promise} All user's orders.
     */
    static findByUserId(userId) {
        const db = getDb();
        const ordersCollection = db.collection("orders");
        return ordersCollection
            .find({ userId: ObjectId.createFromHexString(userId) })
            .toArray()
            .then((orders) => orders)
            .catch((err) => {
                throw new Error(err);
            });
    }
}

export default Order;
