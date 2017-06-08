This project contains core modules for [ords-core](https://github.com/MedSolve/ords-core)

# Gitter Channel
[Chat in Gitter](https://gitter.im/GallVp/chiroit-backend?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

# Using this module
This module exists on npm. To use it run:

```
npm install @ords/modules --save
install install npm:@ords/modules --save
```

# Contents of the module
This contains mutliple modules for each proposal set by ORDS, this also include example maps!

# Global dependencies
- nodejs
- typescript
- typings
- mocha

# Getting started
Initially install dependencies by running:
```
npm run build-env
```
Whenever you have made changes you can run the following command
```
npm run build-depoly
```
## Scripts
In order to test the project you can now run:
```
npm test
```
To clean the project do:
```
npm run clean
```

# Contribution
Modules can be created seperatly from this core project. These core modules in thie repo implements proposals from the *proposals* directory in [ords-core](https://github.com/MedSolve/ords-core). Essentially all kinds of modules can be created, but modules following the *proposals* will be more interopable. Below are some general rules of code:

- Use camleCase instead of underscore
- Document your code with comments
- Write at least unit tests
- Follow established directory structure

Ideas for naming to and directory structure to keep consistensy *modules/:type/:type.:custom.ts* where type is the type of module and custom can be everything. A mongodb db will be *modules/database/database.mongo.ts* with the class name being *DatabaseMongo*.

# Versioning
We use schemantic versioning. Do no introduce backwards compatible breakable code without upgrading the software version to a major release.