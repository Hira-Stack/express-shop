// Handling "Not Found (404)" page
export const get404 = (req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: "/404"
        // path: "req.path"
    });
};

// Implement some another error handling
// export const someOtherErrorHandler = () => {};


