class CartItem {
    constructor(productId, title, price, quantity = 0) {
        this.productId = productId;
        this.title = title;
        this.price = price;
        this.quantity = quantity;
    }
}

export default CartItem;
