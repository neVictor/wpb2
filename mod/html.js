import fs from "fs";
import path from "path";
import pretty from "pretty";

function include_file(input_text, path_to_include_f) {
    let result_obj = {
        file_data: new String(),
        ifcount: 0
    };

    result_obj.file_data = input_text;

    let include_tags = input_text.match(/@@include\((.*?)\)|@@include\((.*?)\)/gs);

    if (include_tags !== null) {
        for (const include_tag of include_tags) {

            let include_file_params = include_tag.match(/(?<=@@include\(s*).*?(?=\s*\))/gs)[0].split(/\,|\;/);
            let include_file_name = include_file_params[0].match(/((?<=\"s*)|(?<=\'s*)).*?((?=\s*\")|(?=\s*\'))/gs)[0];
            let include_file_replaces = new Object();
            let include_file_data = new String();

            if (include_file_params.length > 1) {
                include_file_replaces = JSON.parse(include_file_params[1])
            };
            
            if (fs.existsSync(path_to_include_f + '\\' + include_file_name.replace("./", '/'))) {

                include_file_data = fs.readFileSync(path_to_include_f + '\\' + include_file_name.replace("./", '/'), "utf8");

                for (const include_file_replace_tag in include_file_replaces) {  
                    include_file_data = include_file_data.replace("@@" + include_file_replace_tag, include_file_replaces[include_file_replace_tag])
                };

                result_obj.ifcount++;
            } else {
                include_file_data = '';
            };

            if (include_file_data != '') {
                result_obj.file_data = result_obj.file_data.replace(include_tag, include_file_data);
            };
        };

    } else {
        result_obj.file_data = input_text;
    };

    return result_obj;
}

export default {
    name: "html",

    action: (task, event_type, filepath) => {

        if (event_type == "unlink" || event_type == "unlinkDir") return;
        
        if (!fs.existsSync(task["dest"])) {
            fs.mkdirSync(task["dest"], { recursive: true });
        };

        let file_data = new String();
        let filename = filepath.replaceAll('\\', '/').split('/').at(-1);

        if (path.relative(task["src"], filepath).match(/\\|\//) === null) {
            file_data = fs.readFileSync(filepath, "utf8");
            let include_file_data = include_file(file_data, task["include"]);

            if (include_file_data.ifcount > 0) {
                fs.writeFileSync(task["dest"] + '/' + filename, pretty(include_file_data.file_data, new Object(task["settings"]["pretty"])), (err) => console.error("HTML file error\n" + err));
                console.log("\x1b[36m", `HTML included files (${include_file_data.ifcount}): \t\t`, "\x1b[32m", filepath, "\x1b[0m");

            } else {
                fs.writeFileSync(task["dest"] + '/' + filename, pretty(file_data, new Object(task["settings"]["pretty"])));
                console.log("\x1b[36m", "HTML file saved to dest: \t\t", "\x1b[32m", filepath, "\x1b[0m");

            };
        } else {
            fs.readdir(task["src"], (err, html_files) => {
                if (err) { console.error(err) };

                for (const html_file of html_files) {
                    if (fs.lstatSync(task["src"] + html_file).isFile()) {

                        file_data = fs.readFileSync(task["src"] + html_file, "utf8");
                        let include_file_data = include_file(file_data, task["include"]);

                        if (include_file_data.ifcount > 0) {
                            fs.writeFileSync(task["dest"] + html_file, pretty(include_file_data.file_data, new Object(task["settings"]["pretty"])), (err) => console.error("HTML file error\n" + err));
                            console.log("\x1b[36m", `HTML included files (${include_file_data.ifcount}): \t\t`, "\x1b[32m", filepath, "\x1b[0m");
                        };
                    };
                };
            });

            console.log("\x1b[36m", "HTML file was saved:\t\t\t", "\x1b[32m", filepath, "\x1b[0m");
        };

        return;
    },
}; 