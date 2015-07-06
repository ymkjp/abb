abb
===

Testing Framework for API as Black Box

## Description

## Demo

## Requirement
* `node --version  # v0.10.37 or above`

## Usage

## Install
Install app from NPM:

```shell
npm install abb
```

## Tips
* It is good practice to avoid messy document diffs by fixating random values
```js
var Abb = require('abb').create({docMode: true});
var random = Abb.random();
random.integer(1, 100);
```

## Contribution

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

