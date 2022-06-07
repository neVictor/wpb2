import fs from "fs";
import path from "path";

function addToString(string = "", add = "", add_to_index = 0) {
    return string.substring(0, add_to_index) + add + string.substring(add_to_index, string.length)
};

function html_to_scss(path_to_input_file = "", path_to_output_file = "") {
    let html_file_content = fs.readFileSync(path_to_input_file, "utf8");
    let html_class_elements_unsorted = html_file_content.match(/((?<=class=\"s*)|(?<=class=\'s*)).*?((?=\s*\")|(?=\s*\'))/gs);

    if (html_class_elements_unsorted === null) return;
    html_class_elements_unsorted = html_class_elements_unsorted.join(' ').split(' ');

    let spliters = [' ', '\n', '\t', '{'];
    let html_class_elements = new Array();

    for (const html_class_element of html_class_elements_unsorted) {
        let is_element_empty = false;

        for (const spliter of spliters) {
            if (html_class_element.includes(spliter) || html_class_element.startsWith("@@") || html_class_element == '') {
                is_element_empty = true;
            }
        }

        if (!is_element_empty) {
            html_class_elements.push(html_class_element);
        }
    };

    let scss_file_content = new String();
    let scss_blocks_map = new Map();

    if (fs.existsSync(path_to_output_file)) {
        scss_file_content = fs.readFileSync(path_to_output_file, "utf8");
    };

    for (const html_class_element of html_class_elements) {
        let html_block_objs = html_class_element.split("__");
        let scss_block_map = new Map();

        if (scss_blocks_map.has(html_block_objs[0])) {
            scss_block_map = scss_blocks_map.get(html_block_objs[0])
        };

        if (html_block_objs.length > 1) {
            let block_element_objs = html_block_objs[1].split('_');
            let scss_element_set = new Set();

            if (scss_block_map.has(block_element_objs[0])) {
                scss_element_set = scss_block_map.get(block_element_objs[0])
            };

            if (block_element_objs.length > 1) {
                for (const block_element_obj of block_element_objs) {
                    if (block_element_obj != block_element_objs[0]) {
                        scss_element_set.add(block_element_obj)
                    }
                }
            };

            scss_block_map.set(block_element_objs[0], scss_element_set);
        };

        scss_blocks_map.set(html_block_objs[0], scss_block_map);
    }

    let block_cursor = 0, element_cursor = 0, modifier_cursor = 0;
    let block_content = '', element_content = '', modifier_content = '';
    let element_opened_block_count = 0, element_end_index = 0;

    for (const scss_block_name of scss_blocks_map.keys()) {
        block_content = '';

        for (let index = 0; index < spliters.length; index++) {
            block_cursor = scss_file_content.indexOf('.' + scss_block_name + spliters[index], 0)
            if (block_cursor != -1) {
                index = spliters.length;
            }
        }

        if (block_cursor != -1) {
            block_cursor = scss_file_content.indexOf('{', block_cursor) + 1;

            for (const scss_element_name of scss_blocks_map.get(scss_block_name).keys()) {
                element_content = '';

                for (let index = 0; index < spliters.length; index++) {
                    element_cursor = scss_file_content.indexOf('&__' + scss_element_name + spliters[index], block_cursor)
                    if (element_cursor != -1) {
                        index = spliters.length;
                    }
                }

                if (element_cursor != -1) {
                    element_cursor = scss_file_content.indexOf('{', element_cursor) + 1;
                    element_end_index = element_cursor;

                    element_opened_block_count++;

                    while (element_opened_block_count != 0) {
                        element_end_index++;

                        if (scss_file_content[element_end_index] == '{') element_opened_block_count++;
                        if (scss_file_content[element_end_index] == '}') element_opened_block_count--;
                    }

                    if (element_cursor != -1) {
                        modifier_content = '';
                        for (const scss_modifier_name of scss_blocks_map.get(scss_block_name).get(scss_element_name)) {
                            let modifier_finded = false;

                            for (let index = 0; index < spliters.length; index++) {
                                modifier_cursor = scss_file_content.indexOf('&_' + scss_modifier_name + spliters[index], element_cursor)

                                if (modifier_cursor != -1 && element_end_index >= modifier_cursor) {
                                    index = spliters.length;
                                    modifier_finded = true;
                                }
                            }

                            if (!modifier_finded) {
                                modifier_content += "\n\t\t&_" + scss_modifier_name + " { }";
                            }
                            //console.log("modifier: \t" + scss_modifier_name + " \tfinded: \t" + modifier_finded + '\n')
                        };

                        scss_file_content = addToString(scss_file_content, modifier_content, element_cursor)
                    };

                    //console.log(scss_element_name + ": \t\tstart\t" + element_cursor + " \tend: " + element_end_index);
                    scss_file_content = addToString(scss_file_content, element_content, element_cursor)
                } else {
                    block_content += "\n\t&__" + scss_element_name + " {\n";
                    for (const scss_modifier_name of scss_blocks_map.get(scss_block_name).get(scss_element_name)) {
                        block_content += "\t\t&_" + scss_modifier_name + "{ }\n"
                    };
                    block_content += "\t}\n"
                }
            };

            scss_file_content = addToString(scss_file_content, block_content, block_cursor)
        } else {
            scss_file_content += '.' + scss_block_name + " {";
            for (const scss_element_name of scss_blocks_map.get(scss_block_name).keys()) {
                scss_file_content += "\n\t&__" + scss_element_name + " {";
                for (const scss_modifier_name of scss_blocks_map.get(scss_block_name).get(scss_element_name)) {
                    scss_file_content += "\n\t\t&_" + scss_modifier_name + " { }\n\t"
                };
                scss_file_content += "}\n"
            };
            scss_file_content += "}\n\n"
        }
    }

    fs.writeFileSync(path_to_output_file, scss_file_content, (err) => { throw console.error("SCSS file err\n" + err) });
};

export default {
    name: "htmltoscss",

    action: (task, event_type, filepath) => {

        if (event_type == "unlink" || event_type == "unlinkDir") return;

        if (!fs.existsSync(task["dest"])) {
            fs.mkdirSync(task["dest"], { recursive: true });
        };

        let filename = filepath.replaceAll('\\', '/').split('/').at(-1);

        html_to_scss(filepath, task["dest"] + '\\' + filename.replace(".html", ".scss"));
        console.log("\x1b[36m", "HTML file was converted to SCSS: \t", "\x1b[32m", filepath, "\x1b[0m");

        return;
    },
};