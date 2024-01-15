module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest/globals": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}",
                "babel.config.js",
                "jest.config.js",
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        },
        {
            "files": [
                "test/**"
            ],
            "plugins": ["jest"],
            "extends": ["plugin:jest/recommended"],
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
    }
}
