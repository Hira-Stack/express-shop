import { ObjectId } from "mongodb";
import { getDb } from "../util/database.js";

// Define a product model
class Product {
    /**
     * @property {string} title => Product's title
     * @property {string} imageUrl => Product's image URL
     * @property {string} price => Product's price
     * @property {string} title => Product's description
     * @property {ObjectId} userId => ID of user that inserted image
     */
    constructor(title, imageUrl, price, description, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this.userId = userId;
    }

    /**
     * @param {boolean} updateMode (If true => update a document that _id: updatedId)
     * @param {string} updatedId ID of the product that should be updated.
     * @returns Promise (IF updateMode === true ? <update a document> : <insert a new document>)
     */
    save(updateMode = false, updatedId = -1) {
        const db = getDb();
        const productsCollection = db.collection("products");

        if (updateMode) {
            return productsCollection.updateOne(
                { _id: ObjectId.createFromHexString(updatedId) },
                { $set: this }
            );
        }

        return productsCollection.insertOne(this);
    }

    /**
     * Add new product item to user's cart
     * @returns {Promise} All saved products.
     */
    static fetchAll() {
        const db = getDb();
        const productsCollection = db.collection("products");
        return productsCollection
            .find()
            .toArray()
            .then((products) => products)
            .catch((err) => {
                throw new Error(err);
            });
    }

    /**
     * Found a product by ID.
     * @param {string} productId The ID of the product to be found.
     * @returns {Promise} The matched product to productId.
     */
    static findById(productId) {
        const db = getDb();
        const productsCollection = db.collection("products");
        return productsCollection
            .findOne({ _id: ObjectId.createFromHexString(productId) })
            .then((product) => product)
            .catch((err) => {
                throw new Error(err);
            });
    }

    /**
     * Delete a product by ID.
     * @param {string} productId The ID of the product to be deleted from the cart.
     * @returns {Promise} Product delete result.
     */
    static deleteById(productId) {
        const db = getDb();
        const productsCollection = db.collection("products");
        return productsCollection.deleteOne({
            _id: ObjectId.createFromHexString(productId)
        });
    }
}

export default Product;

// Define a product model
// const Product = sequelize.define("Product", {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     imageUrl: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     price: {
//         type: DataTypes.DOUBLE,
//         allowNull: false
//     },
//     description: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }
// });
