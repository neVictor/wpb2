import babel from "@babel/core";
import fs from "fs";
import path from "path";

export default {
    name: "js",

    action: (task, event_type, filepath) => {
        
        if (event_type == "unlink" || event_type == "unlinkDir") return;
        
        if (!fs.existsSync(task["dest"])) {
            fs.mkdirSync(task["dest"], { recursive: true });
        };

        let js_formatted_data;

        if (fs.lstatSync(filepath).isFile()) {
            if (path.relative(task["src"], path.dirname(filepath)) == '') {
                try {
                    js_formatted_data = babel.transformSync(fs.readFileSync(filepath, "utf8"), new Object(task["settings"]["babel"]));
                } catch (err) {
                    console.error("\x1b[31m", "JS render error:\n", "\x1b[37m" + "\tFile: " + filepath + "\n\tLine: " + err.loc.line + "\n\tColumn: " + err.loc.column + "\n\treasonCode: " + err.reasonCode, "\x1b[0m");
                };

                if (js_formatted_data !== undefined) {
                    if (task["settings"]["babel"]["sourceMaps"]) {
                        if (!fs.existsSync(task["dest-map"])) {
                            fs.mkdirSync(task["dest-map"], { recursive: true });
                        };

                        fs.writeFileSync(task["dest-map"] + '/' + filepath.replaceAll('\\', '/').split('/').at(-1) + ".map",
                            "{\n\t\"mappings\": \"" + js_formatted_data.map.mappings + "\"\n}",
                            (err) => { console.error("JS.MAP file error\n" + err) });
                    };

                    fs.writeFileSync(task["dest"] + '/' + filepath.replaceAll('\\', '/').split('/').at(-1), js_formatted_data.code + ' ', (err) => { console.error("JS file error\n" + err) })
                };

                console.log("\x1b[36m", "JS file was formatted and saved: \t", "\x1b[32m", filepath, "\x1b[0m");
            };
        };
        return;
    },
};