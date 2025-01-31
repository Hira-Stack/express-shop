import { ObjectId } from "mongodb";

import { getDb } from "../util/database.js";

class User {
    constructor(username, email, cart) {
        this.name = username;
        this.email = email;
        this.cart = cart;
    }

    save(editMode = false, updatedId = -1) {
        const db = getDb();
        const usersCollection = db.collection("users");

        if (editMode) {
            return usersCollection
                .updateOne(
                    { _id: ObjectId.createFromHexString(updatedId) },
                    {
                        $set: {
                            name: this.name,
                            email: this.email,
                            cart: this.cart
                        }
                    }
                )
                .catch((err) => {
                    throw new Error(err);
                });
        }
        return usersCollection.insertOne(this);
    }

    static findById(id) {
        const db = getDb();
        const usersCollection = db.collection("users");
        return usersCollection
            .findOne({ _id: ObjectId.createFromHexString(id) })
            .then((user) => user)
            .catch((err) => {
                throw new Error(err);
            });
    }

    static getCartByUserId(userId) {
        const db = getDb();
        const usersCollection = db.collection("users");
        return usersCollection
            .findOne({ _id: ObjectId.createFromHexString(userId) })
            .then((user) => user.cart)
            .catch((err) => {
                throw new Error(err);
            });
    }
}

export default User;
