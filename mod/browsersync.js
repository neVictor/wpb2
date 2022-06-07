import browserSync from "browser-sync";

export default {
    name: "browsersync",

    action: (task, event_type, filepath) => {

        if (browserSync.has(task["name"])) {
            browserSync.get(task["name"]).reload();
        } else {
            browserSync.create(task["name"]).init(new Object(task["settings"]["browsersync"]));
        };

        return;
    },
};