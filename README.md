# MpegTS Parser

This Node.js script reads data from `process.stdin` and parses the `ts` file.

## Prerequisites

* Node.js (v22 or later recommended)

## Installation

### Install Node.js

If you don't have Node.js installed, download and install it from:

* [Node.js official website](https://nodejs.org/en/download)

Alternatively, you can install it via a package manager:

For macOS (Homebrew):

```sh
brew install node
```

For Ubuntu/Debian:

```sh
sudo apt update && sudo apt install nodejs npm
```

For Windows:
Download and install the latest version from [Node.js official website](https://nodejs.org/en/download).

## How to run

1. Run the `mpegts-parser.js` file like this to parse a `ts` file

    ```sh
    cat test_success.ts | node mpegts-parser.js
    ```

    or

    ```sh
    cat test_failure.ts | node mpegts-parser.js
    ```
