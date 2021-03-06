const PROMISES = new Map();
const OBJECTS = new Map();

const TYPE_MAP = new Map([
  ["json", ["json"]],
  ["binary", ["bin"]]
]);

export default class Loader {
  static get onLoad() {
    return Promise.all(PROMISES.values());
  }

  static get promises() {
    return PROMISES;
  }

  static get typeMap() {
    return TYPE_MAP;
  }

  static get(value) {
    return OBJECTS.get(value);
  }

  static load(values) {
    const returnArray = values instanceof Array;
    
    if(!returnArray) {
      values = [values];
    }

    let promises = [];

    for (let value of values) {
      if(!value) {
        continue;
      }

      let promise = PROMISES.get(value) || new Promise(function(resolve, reject) {
        if(Loader.get(value)) {
          resolve(Loader.get(value));
          return;
        }

        let element = value instanceof HTMLElement ? value : null;

        let onLoad = (response) => {
          PROMISES.delete(value);
          OBJECTS.set(value, response);
          if(element) {
            element.removeEventListener("load", onLoad);
            element.removeEventListener("canplaythrough", onLoad);
          }
          resolve(response);
        };

        if(typeof value === "string") {
          let extension = /[\\/](.*)\.(.*)$/.exec(value)[2];

          let tagName;
          if(/\.(png|jpg|gif)$/.test(value)) {
            tagName = "img";
          } else if(/\.(mp4|webm)$/.test(value)) {
            tagName = "video";
          } else if(/\.(mp3|ogg)$/.test(value)) {
            tagName = "audio";
          } else if(/\.(woff|woff2)$/.test(value)) {
            let fontFace = new FontFace(/([^\/]*)\.(woff|woff2)$/.exec(value)[1], `url("${value}")`);
            fontFace.load().then(onLoad);
            document.fonts.add(fontFace);
          } else {
            fetch(value)
            .catch((err) => {
              console.warn(`Fetch error, using XMLHttpRequest instead:\n${err}`);
              return new Promise(function(resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.onload = () => {
                  resolve(new Response(xhr.response, {status: xhr.status}));
                }
                xhr.open("GET", value);
                xhr.send(null);
              });
            })
            .then((response) => {
              let method;
              if(Loader.typeMap.get("json").includes(extension)) {
                method = "json";
              } else if(Loader.typeMap.get("binary").includes(extension)) {
                method = "arrayBuffer";
              } else {
                method = "text";
              }
              return response[method]();
            })
            .then(onLoad);
          }
          if(tagName) {
            element = document.createElement(tagName);
          }
        }

        if(element) {
          let onElementLoad = (e) => {
            onLoad(e.target);
          }

          if(element instanceof HTMLMediaElement) {
            element.addEventListener("canplaythrough", onElementLoad);
          } else {
            element.addEventListener("load", onElementLoad);
          }

          element.src = element.src || value;

          if(element instanceof HTMLMediaElement) {
            element.play();
            if(!element.autoplay) {
              let pauseElement = function() {
                element.pause();
                element.removeEventListener("playing", pauseElement);
              }
              element.addEventListener("playing", pauseElement);
            }
          }
        }
      });

      promises.push(promise);
      PROMISES.set(value, promise);
    }

    return returnArray ? Promise.all(promises) : promises[0];
  }
}
