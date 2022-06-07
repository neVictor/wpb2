import fs from "fs";
import groupCssMediaQueries from "group-css-media-queries-loader/lib/group-css-media-queries.js";
import sass from "node-sass";
import postcss from "postcss";
import autoprefixer from "autoprefixer";

export default {
    name: "css",

    action: (task, event_type, filepath) => {

        if (event_type == "unlink" || event_type == "unlinkDir") return;

        if (!fs.existsSync(task["dest"])) {
            fs.mkdirSync(task["dest"]);
        };

        if (!fs.existsSync(task["dest-map"]) && task["dest-map"] !== undefined) {
            fs.mkdirSync(task["dest-map"]);
        };

        let filename = filepath.replaceAll('\\', '/').split('/').at(-1);
        let data = fs.readFileSync(filepath, "utf8");
        let sass_compiled_data;

        let sass_render_setting = new Object(task["settings"]["sass-renderer"]);
        sass_render_setting["data"] = data;
        sass_render_setting["outFile"] = task["src"] + '\\' + filename;

        try {
            sass_compiled_data = sass.renderSync(sass_render_setting);
        } catch (err) {
            console.error("\x1b[31m", "SCSS render error:\n", "\x1b[0m", err, "\x1b[0m");
            return;
        }

        postcss([groupCssMediaQueries, autoprefixer])
            .process(sass_compiled_data.css, {
                from: filepath,
                to: task["dest"] + '\\' + filename.replace(".scss", ".css"),
            })

            .then((result) => {
                if (sass_compiled_data.map !== undefined) {
                    fs.writeFileSync(task["dest-map"] + '\\' + filename.replace(".scss", ".css.map"), sass_compiled_data.map.toString(), (err) => { console.error("SCSS file err\n" + err) })
                };
                fs.writeFileSync(task["dest"] + '\\' + filename.replace(".scss", ".css"), result.css.toString(), (err) => { console.error("SCSS file err\n" + err) })

                console.log("\x1b[36m", "SCSS file was converted to CSS: \t", "\x1b[32m", filepath, "\x1b[0m");
            })
            .catch((error) => {
                console.log("Error:", error);
            });

        return;
    },
};