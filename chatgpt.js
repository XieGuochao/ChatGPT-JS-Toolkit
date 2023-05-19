/**
 * Author: Guochao Xie @XieGuochao
 * Date: 19-05-2023
 * Description: ChatGPT Wrapper Toolkit
 * License: MIT
 */

const GPT_BASE_URL = "https://api.openai.com";

async function get_request(url, account) {
    const response = await fetch(`${GPT_BASE_URL}${url}`, { 
        headers: {
            "Authorization": `Bearer ${account.getToken()}`,
            "Content-Type": "application/json",
            "OpenAI-Organization": account.getOrg()
        }
    });
    const json = await response.json();
    return json;
}

async function post_request(url, account, data) {
    const response = await fetch(`${GPT_BASE_URL}${url}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${account.getToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    const json = await response.json();
    return json;
}

/**
 * GPTAccount:
 * Stores the organization and token.
 */
function GPTAccount(org, token, default_model) {
    this.org = org;
    this.token = token;
    this.default_model = default_model;
}

GPTAccount.prototype.getOrg = function() {
    return this.org;
}

GPTAccount.prototype.getToken = function() {
    return this.token;
}

GPTAccount.prototype.getDefaultModel = function() {
    return this.default_model;
}

GPTAccount.prototype.getModels = async function() {
    const models = await get_request("/v1/models", this);
    if (!models["data"]) {
        return [];
    }
    // Sort models by id (string)
    models["data"].sort((a, b) => { return a["id"].localeCompare(b["id"]); });
    return models["data"];
}

async function loadGPTAccountFromStorage() {
    const data = await chrome.storage.sync.get(["org", "token", "default_model"]);
    return new GPTAccount(data["org"] || "", data["token"] || "", data["default_model"] || "");
}

GPTAccount.prototype.saveToStorage = async function() {
    await chrome.storage.sync.set({
        "org": this.org,
        "token": this.token,
        "default_model": this.default_model || "",
    });
}

/**
 * GPTChat:
 * A chat with history and token usage.
 * history: Should be [] for a new history.
 * tokenUsages: Should be [] for a new token usage.
 */
function GPTChat(account, model, history, tokenUsages) {
    this.account = account;
    this.model = model || account.getDefaultModel() || "gpt-3.5-turbo";
    this.history = history || [];
    this.tokenUsages = tokenUsages || [];
}

GPTChat.prototype.getHistory = function() {
    return this.history;
}

GPTChat.prototype.getTokenUsages = function() {
    return this.tokenUsages;
}

GPTChat.prototype.getModel = function() {
    return this.model;
}

GPTChat.prototype.getTokenSummary = function() {
    return this.tokenUsages.reduce((a, b) => {
        return {
            "total_tokens": a["total_tokens"] + b["total_tokens"],
            "prompt_tokens": a["prompt_tokens"] + b["prompt_tokens"],
            "completion_tokens": a["completion_tokens"] + b["completion_tokens"],
        }
    }, {
        "total_tokens": 0,
        "prompt_tokens": 0,
        "completion_tokens": 0,
    });
}

GPTChat.prototype.ask = async function(prompt, options, promptCallback) {
    this.history.push({
        "role": (options && (options.user)) || "user", 
        "content": prompt,
    });

    if (promptCallback)
        promptCallback(this);

    const response = await post_request("/v1/chat/completions", this.account, {
        ...options,
        "model": this.model,
        "messages": this.history,
    });

    const answer = response["choices"][0]["message"]["content"];
    const role = response["choices"][0]["message"]["role"];
    this.history.push({
        "role": role,
        "content": answer,
    });
    this.tokenUsages.push({
        "total_tokens": response["choices"][0]["tokens"],
        "prompt_tokens": response["choices"][0]["prompt_tokens"],
        "completion_tokens": response["choices"][0]["completion_tokens"],
    });
}

console.log("ChatGPT.js loaded.");