import chokidar from "chokidar";
import fs from "fs";
import path from "path";

async function getModules(directory) {
    let file_list = new Map();

    for (const file of fs.readdirSync(directory)) {
        let file_path = path.join(directory, file);
        if (fs.statSync(file_path).isFile() && file.endsWith(".js")) {
            let wpb_module = await import("./" + file_path);

            file_list.set(wpb_module.default.name, wpb_module.default.action);
        }
    }

    return file_list;
};

function compareFlags(first_flags_array, second_flags_array) {
    if (new Array(first_flags_array).length != new Array(second_flags_array).length) {
        return false;
    }

    for (let second_array_flag of second_flags_array) {
        if (!new Set(first_flags_array).has(second_array_flag)) {
            return false
        }
    };

    return true;
};

const WPB_CONFIG = JSON.parse(fs.readFileSync("./wpb.config.json", "utf8"));
const WPB_PROCESS_FLAGS = new Set(process.argv.splice(1).filter((flag) => flag.startsWith("--") && flag != "--"));
const WPB_MODULES = await getModules("./mod/");

const WATCHER_SETTINGS = { ignored: new RegExp(WPB_CONFIG["watcher_ignored"].join('|')) };

function WPB() {
    console.log("\x1b[32m", "\nWelcome to WPB. Again.\n", "\x1b[0m");

    for (let wpb_task of WPB_CONFIG["tasks"]) {
        if (!compareFlags(WPB_PROCESS_FLAGS, wpb_task["flags"])) continue;

        if (WPB_MODULES.has(wpb_task["module"])) {
            chokidar.watch(wpb_task["watch"], WATCHER_SETTINGS).on("all", (watcher_event, watcher_path) => {
                WPB_MODULES.get(wpb_task["module"])(wpb_task, watcher_event, watcher_path); 
            });
        } else {
            console.error("\x1b[31m", "Module not found:\t\t\t", "\x1b[0m", wpb_task["module"]);
        };
    };
};

WPB();