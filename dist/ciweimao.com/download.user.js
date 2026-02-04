// ==UserScript==
// @name     刺猬猫章节自动下载
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 打开刺猬猫章节页面时自动保存文章到本地, 支持付费章节。
// @grant    none
// @include	 https://www.ciweimao.com/chapter/*
// @run-at   document-idle
// @version   2026.02.04+185bb62f
// ==/UserScript==

"use strict";
(() => {
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

  // src/utils/isCanvasTainted.ts
  function isCanvasTainted(canvas) {
    try {
      canvas.getContext("2d").getImageData(0, 0, 1, 1);
      return false;
    } catch (err) {
      return err instanceof DOMException && err.name === "SecurityError";
    }
  }

  // src/utils/imageToCanvas.ts
  async function imageToCanvas(img, {
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
    if (img.src && img.crossOrigin !== "anonymous" && isCanvasTainted(canvas)) {
      const corsImage = new Image();
      corsImage.crossOrigin = "anonymous";
      corsImage.src = img.src;
      await corsImage.decode();
      return imageToCanvas(corsImage, { background });
    }
    return canvas;
  }

  // src/utils/imageToMarkdown.ts
  async function imageToMarkdown(img, {
    background
  } = {}) {
    return canvasToMarkdown(
      await imageToCanvas(img, { background }),
      img.alt,
      img.title
    );
  }

  // src/utils/loadImage.ts
  async function loadImage(url) {
    const img = new Image();
    img.src = url;
    img.alt = url;
    await img.decode();
    return img;
  }

  // src/utils/sleep.ts
  async function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  // src/ciweimao.com/download.user.ts
  var __name__ = "刺猬猫章节自动下载";
  (async function() {
    const chapter = document.querySelector("#J_BookCnt .chapter")?.firstChild?.textContent ?? "";
    let lines = [];
    const startTime = Date.now();
    while (lines.length === 0 && Date.now() - startTime < 6e4) {
      await sleep(1e3);
      for (const i of document.querySelectorAll("#J_BookImage")) {
        const match = i.style.backgroundImage.match(/(?:url\(")?(.+)(?:"\))?/);
        if (!match) {
          continue;
        }
        const url = match[1];
        const line = await imageToMarkdown(await loadImage(url));
        lines.push(line);
      }
      for (const i of document.querySelectorAll("#J_BookRead p.chapter")) {
        const line = elementRootText(i);
        lines.push(line);
        for (const img of i.querySelectorAll("img")) {
          await img.decode();
          lines.push(await imageToMarkdown(img));
        }
      }
      for (const i of document.querySelectorAll("p.author_say")) {
        const line = elementRootText(i);
        lines.push(`    ${line}`);
        for (const img of i.querySelectorAll("img")) {
          await img.decode();
          lines.push(await imageToMarkdown(img));
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
  })();
})();
