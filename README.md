# ChatGPT-JS-Toolkit

ChatGPT JavaScript Toolkit is a single JavaScript file to wrap the OpenAI's ChatGPT access. The main purpose is to enable ChatGPT access from the browser's client side.

## Usage

The usage is extremely simple: Just download the file `chatgpt.js` or `chatgpt.min.js`. No `npm` or similar tools are required.

### Example use cases

- Chrome Browser Extension
- Visual Studio Code Extension
- Other use cases are welcome!

## Concerns

Storing the OpenAI API key in the client side is supposed to be insecure. However, we give this option to the user: the privacy and the cost.

For most ChatGPT-enhanced applications, the service providers deploy their own service endpoints as untrusted proxies and have the capability to take advantage of the user's **private data**.

On the other hand, we believe that the decentralized applications have the bright future. The application developers build the prompts and handlers while all requests are sent directly to the OpenAI endpoints. In this way, our **API key** and **private data** are not leaky to the application providers.

The following table summarizes the pros and cons:

| | Centralized App | Decentralized App |
|-|-|-|
| Privacy | **Untrusted** App Providers. | **Trusted** Extension Code (Open-Source). |
| Cost | ChatGPT usage + **application profits**. | ChatGPT **actual usage**. |
| Motivation of Development | Benefits from **extra charges** and **privacy data** (?) | **Love** (?) | 

## Usage Cheatsheets

### OAccount (OpenAI Account)

Store credentials.

```js
let account = new OAccount();
await account.load(); // Load account from storage;

account.api_key = "new key";
await account.save(); // Save account to storage.

const headers = account.headers(); // Generate the header to send queries.
```

### Models

Get the information of models.

```js
const models = account.models();
const [model_list, errorcode, error_message] = models.list();
const [model, errorcode, error_message] = models.retrieve("gpt-3.5-turbo");
```

### OHistory (OpenAI History)

Store history, token usages, and finish reasons (Internal use).

### OChat (OpenAI Chat)

Create and manage a chat.

```js
const chat = new OChat(account);
const [message, errorcode, error_message] = await chat.create("ChatGPT is "); // Send a query. There are more options in the source code.
const history = chat.history; // Get the OHistory object.
```

## Related Projects

- [ChatGPT Chrome Extension Template](https://github.com/XieGuochao/ChatGPT-Chrome-Template)
- [ChatGPT Chrome Extension Demo](https://github.com/XieGuochao/ChatGPT-Chrome-Translator)

## TODO

- [x] Support a minimal set of functionalities to create a Chat.
- [x] Error handling and robustness.
- [ ] Extend and support more functionalities.

## Contact

Any Issue or Pull Request is welcome. You can also contact me via [Homepage](https://xieguochao.com/).
