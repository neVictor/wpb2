import fs from "fs";
import ttf2woff from "ttf2woff";

export default {
    name: "ttftowoff",

    action: (task, event_type, path) => {

        if (event_type == "unlink" || event_type == "unlinkDir") return;
        
        if (!fs.existsSync(task["dest"])) {
            fs.mkdirSync(task["dest"], { recursive: true });
        }

        let filename = path.replaceAll('\\', '/').split('/').at(-1);

        if (!fs.existsSync((task["dest"] + filename).replaceAll(".ttf", ".woff"))) {
            fs.writeFileSync((task["dest"] + filename).replaceAll(".ttf", ".woff"), ttf2woff(fs.readFileSync(path)), (err) => { throw console.error("TTF file err\n" + err) })
            console.log("\x1b[36m", "TTF file was converted to WOFF: \t", "\x1b[32m", path, "\x1b[0m");
        };

        return;
    },
};