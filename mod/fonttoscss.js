import fs from "fs"

export default {
    name: "fonttoscss",

    action: (task, event_type, filepath) => {

        let currentFontWeight, currentFontStyle;

        let scss_file_content = '';

        fs.readdir(task["watch"], (err, font_files) => {
            if (err) { throw console.error(err); }

            for (const font_file of font_files) {

                if (font_file.split('.').at(-1).match(/\.eof|\.ttf|\.woff|.woff2/) && fs.lstatSync(filepath).isFile()) continue;

                switch (font_file.split(/[\.\-]/)[1].toLowerCase().replace("italic", '')) {
                    case "thin":
                        currentFontWeight = 200;
                        break;
                    case "extralight":
                        currentFontWeight = 300;
                        break;
                    case "medium":
                        currentFontWeight = 500;
                        break;
                    case "light":
                        currentFontWeight = 300;
                        break;
                    case "regular":
                        currentFontWeight = 500;
                        break;
                    case "semibold":
                        currentFontWeight = 600;
                        break;
                    case "bold":
                        currentFontWeight = 700;
                        break;
                    case "extrabold":
                        currentFontWeight = 800;
                        break;
                    case "heavy":
                        currentFontWeight = 800;
                        break;
                    case "black":
                        currentFontWeight = 900;
                        break

                    default:
                        currentFontWeight = 400;
                        break;
                };

                currentFontStyle = font_file.split(/[\.\-]/)[1].toLowerCase().includes("italic") ? "italic" : "normal";

                scss_file_content += `\n@font-face {\n\tfont-family: "${font_file.split(/[\.\-]/)[0]}";\n\tfont-style: ${currentFontStyle};\n\tfont-weight: ${currentFontWeight};\n\tfont-stretch: normal;\n\tfont-display: swap;\n\tsrc: url(../fonts/${font_file}) format("${font_file.split('.').at(-1)}");\n}\n\n`
            };

            if (scss_file_content != '') {
                fs.writeFileSync(task["dest"], scss_file_content, (err) => { if (err) { console.error(err); } })
            };
        });

        return;
    },
};