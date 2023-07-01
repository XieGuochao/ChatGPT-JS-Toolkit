/**
 * Author: Guochao Xie @XieGuochao
 * Date: 19-05-2023
 * Description: ChatGPT Wrapper Toolkit
 * License: MIT
 */

let OPENAI_CONFIGURATION = {
    "base_url": "https://api.openai.com",
}

/**
 * Fetch wrapper: fetchGET and fetchPOST
 * Return:
 * [result, errorcode, message]
 */
async function fetchGET(path, headers, errorHandler) {
    const response = await fetch(`${OPENAI_CONFIGURATION.base_url}${path}`, {
        method: "GET",
        headers: headers,
    });
    if (response.ok) {
        const json = await response.json();
        return [json, 0, ""];
    } else {
        if (errorHandler)
            errorHandler(response);
        else
            console.log(response);
        return [null, response.status, response.statusText];
    }
}

async function fetchPOST(path, headers, data, errorHandler) {
    const response = await fetch(`${OPENAI_CONFIGURATION.base_url}${path}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    });
    if (response.ok) {
        const json = await response.json();
        return [json, 0, ""];
    } else {
        if (errorHandler)
            errorHandler(response);
        else
            console.log(response);
        return [null, response.status, response.statusText];
    }
}

/**
 * OAccount:
 * Stores the organization and api_key.
 */
function OAccount(org, api_key, default_model) {
    this.org = org || "";
    this.api_key = api_key || "";
    this.default_model = default_model || "";
}

OAccount.prototype.headers = function () {
    return {
        "Authorization": `Bearer ${this.api_key}`,
        "Content-Type": "application/json",
        "OpenAI-Organization": this.org,
    };
}

OAccount.prototype.save = async function () {
    await chrome.storage.sync.set({
        "org": this.org || "",
        "api_key": this.api_key || "",
        "default_model": this.default_model || "",
    });
}

OAccount.prototype.load = async function () {
    const data = await chrome.storage.sync.get(["org", "api_key", "default_model"]);
    this.org = data["org"] || "";
    this.api_key = data["api_key"] || "";
    this.default_model = data["default_model"] || "";
}

/**
 * Models:
 * List and retrieve models.
 * This class is supposed to be called by OAccount.models().
 */
function Models(account) {
    this.account = account;
}

/**
 * getType:
 * This function is supposed to get the type from an API but OpenAI does not provide it. 
 * */
Models.prototype.getType = async function (model) {
    const prefixMap = {
        "gpt": "CHAT",
        "ada": "TEXT",
        "babbage": "TEXT",
        "code": "TEXT",
        "curie": "TEXT",
        "davinci": "TEXT",
        "text-ada": "TEXT",
        "text-babbage": "TEXT",
        "text-curie": "TEXT",
        "text-davinci": "TEXT",
        "text-embedding": "TEXT",
        "text-search": "TEXT",
        "text-similarity"   : "TEXT",
        "text-moderation": "MODERATION",
        "DALL": "IMAGE",
        "whisper": "AUDIO",
    };

    for (const prefix in prefixMap) {
        if (model.startsWith(prefix)) {
            return prefixMap[prefix];
        }
    }
    return "UNKNOWN";
}

Models.prototype.list = async function (errorHandler) {
    const [json, errorcode, message] = await fetchGET("/v1/models", this.account.headers(), errorHandler);
    if (errorcode == 0) {
        const models = json["data"] || [];
        models.sort((a, b) => { return a["id"].localeCompare(b["id"]); });
        for (const model of models) {
            model["type"] = await this.getType(model["id"]);
        }
        return [models, errorcode, message];
    }
    return [null, errorcode, message];
}

Models.prototype.retrieve = async function (model, errorHandler) {
    const [json, errorcode, message] = await fetchGET(`/v1/models/${model}`, this.account.headers(), errorHandler);
    return [json, errorcode, message];
}

OAccount.prototype.models = function () {
    return new Models(this);
}


/**
 * OHistory:
 * A generic history class.
 */
function OHistory() {
    this.history = [];
    this.token_usages = [];
    this.finish_reasons = [];
}

OHistory.prototype.append = function (history, token_usage, finish_reason) {
    this.history.push(history);
    token_usage = token_usage || null;
    finish_reason = finish_reason || null;
    this.token_usages.push(token_usage);
    this.finish_reasons.push(finish_reason);
}

OAccount.prototype.saveToStorage = async function () {
    await chrome.storage.sync.set({
        "org": this.org,
        "api_key": this.api_key,
        "default_model": this.default_model || "",
    });
}

function historyElement(role, content) {
    return {
        "role": role,
        "content": content,
    }
}


/**
 * OChat:
 * A chat with history and api_key usage.
 */
function OChat(account, model) {
    this.account = account || new OAccount();
    this.history = new OHistory();
    this.model = model || account.default_model;
}

/**
 * create: ask a new messgage.
 */
OChat.prototype.create = async function (prompt, role, options, promptCallback, errorHandler) {
    role = role || "user";
    options = options || {};
    options.model = this.model;
    options.messages = this.history.history;
    this.history.append(historyElement(
        role,
        prompt,
    ));

    if (promptCallback) {
        promptCallback(this);
    }

    const [json, errorcode, error_message] = await fetchPOST(
        "/v1/chat/completions",
        this.account.headers(),
        options,
        errorHandler,
    );

    if (errorcode == 0) {
        const message = json["choices"][0]["message"];
        const token_usage = json["usage"];
        const finish_reason = json["choices"][0]["finish_reason"];
        this.history.append(historyElement(
            message.role,
            message.content,
        ), token_usage, finish_reason);
        return [message, errorcode, error_message];
    }
    return [null, errorcode, error_message];
}

/**
 * ask: alias of create.
 */
OChat.prototype.ask = async function (prompt, role, options, promptCallback, errorHandler) {
    const [message, errorcode, error_message] = await this.create(prompt, role, options, promptCallback, errorHandler);
    return [message, errorcode, error_message];
}

console.log("ChatGPT.js loaded.");