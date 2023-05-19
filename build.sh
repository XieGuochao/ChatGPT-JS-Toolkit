#!/bin/sh

# Author: Guochao Xie @XieGuochao
# Created on 19-05-2023
# License: MIT

# Compress `chatgpt.js` to `chatgpt.min.js`.

# Install uglifyjs
# npm install uglify-js -g

# Use `uglifyjs` to compress the file.
uglifyjs chatgpt.js -o chatgpt.min.js -c -m

