function deleteProduct(btn) {
    const cardActionElement = btn.parentNode;
    const productID = cardActionElement.querySelector("[name=productID]").value;
    const csrf = cardActionElement.querySelector("[name=_csrf]").value;
    const productElement = btn.closest("article");
    fetch(`/admin/product/${productID}`, {
        method: "DELETE",
        headers: {
            "csrf-token": csrf
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((jsonData) => {
            console.log(jsonData);
            productElement.parentNode.removeChild(productElement);
        })
        .catch((err) => console.log(err));
}
