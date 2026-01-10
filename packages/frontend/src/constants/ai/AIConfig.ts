import { AIConfig } from "@/types/ai/eliza/character";

export const defaultConfig: AIConfig = {
    name: "",
    modelProvider: "deepseek",
    bio: [""],
    lore: [""],
    topics: [""],
    messageExamples: [],
    postExamples: [""],
    adjectives: [""],
    settings: {
        voice: {
            model: "en_US-male-medium",
        },
    },
    plugins: [],
    style: {
        all: [],
        chat: [],
        post: [],
    },
};
