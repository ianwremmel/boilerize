# boilerize _(@ianwremmel/boilerize)_
TODO circleci
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> boilerize applies common config to an existing JavaScript repo

boilerize applies common config to an existing JavaScript repo.
- sort package.json
- add tooling inspired by react boilerplate
  - lint staged before commit
  - add common scripts to npm scripts
  - configure eslint
  - configure mocha?
  - semantic-release
- add standard dependencies
  - eslint
  - mocha
  - plop
  - common plop repo?
- run setup scripts
  - ensure github project exists
  - hook into circleci
- add circleci.yml
- add eslintrc
  - @ianwremmel/eslint-rules/react
  - @ianwremmel/eslint-rules/es5
  - @ianwremmel/eslint-rules/es6
  - @ianwremmel/eslint-rules/mocha
- drop a .boilerizerc which specifies
  - eslint rule target (react, es5, es6, etc)
- drop license file
