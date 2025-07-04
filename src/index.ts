import { createClient } from "./client";
import botConfig from "../config/bots.json";
import {Bot} from "./types/BotTypes";

botConfig.forEach((data:Bot) => {
    createClient(data);
});