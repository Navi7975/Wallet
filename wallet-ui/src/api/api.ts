import axios from "axios";

const API = axios.create({
    baseURL: "https://wallet-zvqs.onrender.com/api",
});

export default API;
