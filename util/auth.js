export function isLoggedIn(request) {
    // const cookies = request.headers?.cookie;
    // return cookies?.split("=")[1] === "true";
    return request.session?.isLoggedIn === true;
}
