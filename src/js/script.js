let header = document.getElementById("header");
let header_container = header.getElementsByClassName("header__container")[0];
let header_burger_btn = document.getElementById("header-menu-burger-btn");
let header_menu_list = document.getElementById("header-menu-list");

let manga_content = document.getElementById("manga-section-content");

header_burger_btn.addEventListener("click", () => {
    header_menu_list.classList.toggle("menu__list_open");
    header_burger_btn.querySelector('.menu__burger-icon').classList.toggle("menu__burger-icon_close")
});

document.addEventListener("scroll", () => {
    header_menu_list.classList.remove("menu__list_open");
    header_burger_btn.querySelector('.menu__burger-icon').classList.remove("menu__burger-icon_close")
});


document.addEventListener("mousemove", (event) => {
    if (event.clientY < document.body.clientHeight / 10) {
        header_container.classList.add("header__manga-page_open")
    } else if (!header_menu_list.classList.contains("menu__list_open")) {
        header_container.classList.remove("header__manga-page_open")
    }
});

// class imageLoader {

//     #image_array;
//     #image_count;

//     constructor(path_to_folder) {
//         this.#getJSON(path_to_folder + "info.json", (status, data) => {
//             console.log(data);

//             //this.#image_array = data;
//             this.#image_count = data["pages"].length;
//             this.#image_array = new Array(data["pages"].length);

//             for (let index = 0; index < this.#image_count; index++) {
//                 this.#image_array[index] = this.#loadImage(path_to_folder + data["pages"][index]);
//             }
//         });
//     };

//     getImagesCount() {
//         return this.#image_count;
//     };

//     getImageById(id) {
//         return this.#image_array[id];
//     };

//     async #loadImage(urt) {
//         let image_load = new Promise((resolve, reject) => {
//             let image = new Image();
//             image.src = urt;
//             image.onload = () => resolve(image);
//             image.onerror = reject
//         });

//         return await image_load;
//     }

//     #getJSON(url, callback) {
//         var xhr = new XMLHttpRequest();

//         xhr.open('GET', url, true);
//         xhr.responseType = 'json';
//         xhr.onload = () => {
//             var status = xhr.status;
//             if (status === 200) {
//                 callback(null, xhr.response);
//             } else {
//                 callback(status, xhr.response);
//             }
//         };
//         xhr.send();
//     };
// }

// let mangaImages = new imageLoader("./files/nagatoro/100_uk/");
