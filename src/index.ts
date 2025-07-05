import { createClient } from "./client";
import botConfig from "../config/bots.json";
import {Bot} from "./types/BotTypes";
import { initConfig } from "./utils/init";

initConfig();
botConfig.forEach((data:Bot) => {
    createClient(data);
});