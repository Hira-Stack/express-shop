// Handling "Not Found (404)" page
export const get404 = (req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: "/404"
    });
};

// Handling 500 error status page
export const get500 = (req, res, next) => {
    const status500 = res.status(500);
    return status500.render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
};
