class UploadFiles {
  static dirUploads = path.join(__dirname, "../uploads/");

  static Upload(config = {}) {
    let {
      srcList = [],
      dest,
      manualFormat = false,
      formats = [],
      preview = false,
      torewrite = [],
      viewProgress = {},
      endCallback,
    } = config;

    let totalLinks = srcList.length;
    let countConectionsClosed = 0;
    let span = null;
    let multipleFormats = formats;
    let progressFunctions = Object.keys(viewProgress).length;
    let files = [];

    if (!srcList.length || !totalLinks) return false;

    if (dest) {
      this.dirUploads = path.join(__dirname, dest);
      dest = this.dirUploads;
    } else {
      dest = this.dirUploads;
    }

    // Functions
    let showProgress = progressFunctions ? this.showProgress : null;
    let progressChunk = progressFunctions ? this.#progressChunk : null;
    let endProcess = progressFunctions ? this.#endProcess : null;

    srcList.forEach((src, i) => {
      let format = this.checkExtension({
        format: src.toLowerCase(),
        formats: multipleFormats,
      });

      if (!format && !manualFormat) return false;

      let progress = 0;
      if (viewProgress.style == "unique" && span == null) {
        span = showProgress(src, viewProgress);
      }

      // option for manual format
      format = manualFormat ? manualFormat : format;
      // to rewrite file or create a new name
      let fileName = torewrite.length ? torewrite[i] : this.#uniqueName(format);

      let fullPathFile = `${dest}${fileName}`;

      files.push(fileName);
      
      let { size } = fs.statSync(src);

      let writer = fs.createWriteStream(fullPathFile, {
        flags: "w",
      });

      let reader = fs.createReadStream(src).pipe(writer);
      if (viewProgress.selector) {
        if (viewProgress.style != "unique" || totalLinks == 1) {
          let span = showProgress(src, viewProgress);

          fs.createReadStream(src).on("data", (chunk) => {
            progress += chunk.length;
            progressChunk({ size, span, progress });
          });
        }
      }

      reader.on("close", () => {
        countConectionsClosed++;
        if (endProcess) {
          endProcess({ countConectionsClosed, viewProgress, totalLinks, span });
        }
        if (countConectionsClosed == totalLinks) {
          if(typeof endCallback === "function"){
            endCallback(files);
          }
        }
      });
    });
  }

  static #uniqueName(format) {
    let characters = "abcdefghijklmnñopqrstuvwxyz";
    let numbers = "1234567890";
    let max = 10;
    let fileName = "";
    for (let i = 0; i < max; i++) {
      fileName += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      fileName += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    let date = new Date().getSeconds();
    return `${fileName}_${parseInt(date * 15)}_${format}`;
  }

  static checkExtension(config) {
    // Default formats
    let allFormats = [
      ".jpg",
      ".png",
      ".gif",
      ".mp3",
      ".mp4",
      ".mkv",
      ".avi",
      ".wmv",
    ];

    let { format, formats } = config;

    formats = formats.length ? formats : allFormats;

    let formatsLength = formats.length;

    for (let i = 0; i < formatsLength; i++) {
      if (formats[i] == format.match(/.\w+$/)) {
        return formats[i];
      }
    }
    return false;
  }
  static removeFile(srcList, func) {
    srcList.forEach((src) => {
      let dir = path.join(this.dirUploads, src);
      try {
        if (fs.statSync(dir)) {
          try {
            fs.unlinkSync(dir);
            func(dir);
          } catch (error) {
            func(error);
          }
        }
      } catch (error) {
        func(error);
      }
    });
  }
  static showProgress(src, viewProgress) {
    if (!Object.values(viewProgress).length) return;
    const { selector, style = "list", showCount } = viewProgress;

    if (!selector) return;

    let progressList = document.querySelector(selector);
    let li = document.createElement("li");
    let span = document.createElement("span");

    const totalProgress = () => {
      if (showCount) {
        let li = document.createElement("li");
        li.classList.add("total-progress");
        progressList.append(li);
      }
    };
    const simpleLI = () => {
      totalProgress();
      span.classList.add("progress");
      progressList.append(li);
      li.append(span);
    };
    switch (style) {
      case "list":
        totalProgress();
        span.classList.add("progress");
        li.innerHTML = `<span class="link-name">${
          src.split("/").slice(-1)[0]
        }</span>`;
        console.log(progressList);
        progressList.append(li);
        li.append(span);
        return span;
      case "list-bar":
        simpleLI();
        return span;
      case "unique":
        simpleLI();
        return span;
    }
  }

  static #progressChunk(config) {
    let { size, span, progress } = config;
    let progressBar = `${parseInt((progress / size) * 100)}%`;
    span.innerHTML = progressBar;
    span.style.width = progressBar;
  }
  // For end process ej. 8/8
  static #endProcess(config) {
    let { countConectionsClosed, viewProgress, totalLinks, span } = config;

    if (viewProgress.style == "unique" && totalLinks > 1) {
      let progressBar = `${parseInt(
        (countConectionsClosed * 100) / totalLinks
      )}%`;
      span.innerHTML = progressBar;
      span.style.width = progressBar;
    }
    if (viewProgress.showCount) {
      document.querySelector(
        ".total-progress"
      ).innerHTML = `${countConectionsClosed}/${totalLinks}`;
    }
  }
  static downloadImages(config) {
    const {
      srcList,
      viewProgress = {},
      format = ".jpg",
      endCallback = false,
    } = config || {};

    const fetch = require("node-fetch");

    let progressFunctions = Object.keys(viewProgress).length;
    let totalLinks = srcList.length;
    let countConectionsClosed = 0;
    let span = null;
    let files = [];

    // Functions
    let showProgress = progressFunctions ? this.showProgress : null;
    let progressChunk = progressFunctions ? this.#progressChunk : null;
    let endProcess = progressFunctions ? this.#endProcess : null;

    srcList.forEach((src, i) => {
      let progress = 0;
      if (viewProgress.style == "unique" && span == null) {
        span = showProgress(src, viewProgress);
      }
      fetch(src).then((res) => {
        let fileName = this.#uniqueName(format);

        let fullPathFile = `${this.dirUploads}${fileName}`;
        let fileStream = fs.createWriteStream(fullPathFile);

        files.push(fileName);

        res.body.pipe(fileStream);

        let size = res.headers.get("content-length");
        let reader = res.body;

        if (viewProgress.selector) {
          if (viewProgress.style != "unique" || totalLinks == 1) {
            let span = showProgress(src, viewProgress);
            reader.on("data", function (chunk) {
              progress += chunk.length;
              progressChunk({ size, span, progress });
            });
          }
        }

        reader.on("close", () => {
          countConectionsClosed++;
          if (endProcess) {
            endProcess({
              countConectionsClosed,
              viewProgress,
              totalLinks,
              span,
            });
          }
          if (typeof endCallback === "function") {
            if (countConectionsClosed == totalLinks) {
              endCallback(files);
            }
          }
        });
      });
    });
  }
}
module.exports = UploadFiles;
