import isProduction from "./isProduction";

const backendURL = `http://${isProduction() ? 'backend:81' : 'localhost:81'}`

export {backendURL};