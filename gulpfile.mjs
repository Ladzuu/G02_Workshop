// GULP
import { src, dest, watch, series } from "gulp";

// JS
import resolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";


// -- JS tasks
const bundleJS = () => {
    return rollup({
        input: "./src/js/main.js",
        plugins: [resolve()],
    }).then((bundle) => {
        return bundle.write({
            file: `./js/main.js`,
        });
    });
};

// -- Watch tasks
const wJs = watch(['./src/**/*.js']);

wJs.on("all", series(bundleJS));

// -- Exports

export default series( bundleJS );