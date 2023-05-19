# Design

ChatGPT JS Toolkit aims to be the simplest solution to use ChatGPT from the browser's client side. It is possible with the power of Chrome Extension.

## Simplicity

- A single file is all you need.
- Pure native JavaScript.
- No `npm` or similar tools are required.

## Interface Design

The toolkit has the following hierarchy:

- `GPTAccount` is a instance that stores the credential.
  - `GPTChat` is a chat instance.