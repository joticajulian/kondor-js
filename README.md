# Kondor JS

Library to interact with Kondor extension for Koinos blockchain.

## Table of Contents

1. [Install](#install)
2. [Usage](#usage)
3. [Documentation](#documentation)
4. [License](#license)

## Install

Install the package from NPM

```sh
npm install kondor-js
```

You can also load it directly to the browser by downloading the bunble file located at `dist/kondor.min.js`, or its non-minified version `dist/kondor.js` (useful for debugging).

## Usage

### Browser

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My App</title>
    <script src="koinos.min.js"></script>
    <script>
      (async () => {
        const provider = new Provider(["http://api.koinos.io:8080"]);
        const signer = Signer.fromSeed("my seed");
        signer.provider = provider;
        const koinContract = new Contract({
          id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
          abi: utils.tokenAbi,
          provider,
          signer,
        });
        const koin = koinContract.functions;

        // Get balance
        const { result } = await koin.balanceOf({
          owner: signer.getAddress(),
        });
        console.log(balance.result);
      })();
    </script>
  </head>
  <body></body>
</html>
```

## Acknowledgments

Many thanks to the sponsors of this library: @levineam, @Amikob, @motoeng, @isaacdozier, @imjwalker, and the private sponsors.

If you would like to contribute to the development of this library consider becoming a sponsor in https://github.com/sponsors/joticajulian.

## License

MIT License

Copyright (c) 2021 Julián González

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
