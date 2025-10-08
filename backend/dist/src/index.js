"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app_1.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
