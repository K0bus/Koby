import { createClient } from "./client";
import botConfig from "../config/bots.json";

botConfig.forEach((data) => {
    createClient(data);
});