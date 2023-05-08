// ==UserScript==
// @name     刺猬猫章节自动下载
// @namespace https://github.com/NateScarlet/user-scripts
// @description 打开刺猬猫章节页面时自动保存文章到本地, 支持付费章节。
// @grant    none
// @include	 https://www.ciweimao.com/chapter/*
// @run-at   document-idle
// @version   2023.05.08+33e4eae0
// ==/UserScript==

(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/utils/elementRootText.ts
  function elementRootText(element) {
    let ret = "";
    for (const i of element.childNodes) {
      if (i.nodeType === i.TEXT_NODE) {
        ret += i.nodeValue;
      }
    }
    return ret.trim();
  }

  // src/utils/canvasToMarkdown.ts
  function canvasToMarkdown(canvas, alt = "", title = "") {
    return `![${alt}](${canvas.toDataURL()} "${title}")`;
  }

  // src/utils/imageToCanvas.ts
  function imageToCanvas(img, {
    background
  } = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  // src/utils/imageToMarkdown.ts
  function imageToMarkdown(img, {
    background
  } = {}) {
    return canvasToMarkdown(imageToCanvas(img, { background }), img.alt, img.title);
  }

  // src/utils/loadImage.ts
  function loadImage(url) {
    return __async(this, null, function* () {
      const img = new Image();
      img.src = url;
      img.alt = url;
      yield img.decode();
      return img;
    });
  }

  // src/utils/sleep.ts
  function sleep(duration) {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        setTimeout(resolve, duration);
      });
    });
  }

  // src/ciweimao.com/download.user.ts
  var __name__ = "刺猬猫章节自动下载";
  (function() {
    return __async(this, null, function* () {
      const chapter = document.querySelector("#J_BookCnt .chapter").firstChild.textContent;
      let lines = [];
      let startTime = Date.now();
      while (lines.length === 0 && Date.now() - startTime < 6e4) {
        yield sleep(1e3);
        for (const i of document.querySelectorAll("#J_BookImage")) {
          const url = i.style["background-image"].match(/(?:url\(")?(.+)(?:"\))?/)[1];
          const line = imageToMarkdown(yield loadImage(url));
          lines.push(line);
        }
        for (const i of document.querySelectorAll("#J_BookRead p.chapter")) {
          const line = elementRootText(i);
          lines.push(line);
          for (const img of i.querySelectorAll("img")) {
            yield img.decode();
            lines.push(imageToMarkdown(img));
          }
        }
        for (const i of document.querySelectorAll("p.author_say")) {
          const line = elementRootText(i);
          lines.push(`    ${line}`);
          for (const img of i.querySelectorAll("img")) {
            yield img.decode();
            lines.push(imageToMarkdown(img));
          }
        }
        lines = lines.filter((i) => i.length > 0);
      }
      console.log(`${__name__}: 获取到 ${lines.length} 行`);
      const file = new Blob([`# ${chapter}

`, lines.join("\n\n") + "\n"], {
        type: "text/markdown"
      });
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(file);
      anchor.download = `${location.pathname.split("/").slice(-1)[0]} ${document.title}.md`;
      anchor.style["display"] = "none";
      document.body.append(anchor);
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(anchor.href);
      }, 0);
    });
  })();
})();
