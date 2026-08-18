// package.json scripts section
{
  "scripts": {
    "build": "npm run build:clean && npm run build:types && npm run build:js",
    "build:clean": "rm -rf dist",
    "build:types": "tsc --emitDeclarationOnly",
    "build:js": "rollup -c",
    "build:watch": "rollup -c -w",
    "dev": "npm run build:watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "storybook": "start-storybook -p 6006",
    "build:storybook": "build-storybook",
    "prepublishOnly": "npm run build",
    "preversion": "npm run lint && npm run test",
    "version": "npm run format && git add -A src",
    "postversion": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}