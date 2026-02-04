// ==UserScript==
// @name     小説家になろう book downloader
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description Add `download all chapter` button to syosetu.com (you need login to download chapters )
// @grant    GM.xmlHttpRequest
// @include	 /^https?://ncode\.syosetu\.com/\w+/$/
// @include	 /^https?://novel18\.syosetu\.com/\w+/$/
// @run-at   document-end
// @version   2026.02.04+5b30d66e
// ==/UserScript==

"use strict";
(() => {
  // src/utils/urlLastPart.ts
  function urlLastPart(url) {
    return url.split("/").filter((i) => i).slice(-1)[0];
  }

  // src/utils/downloadFile.ts
  function downloadFile(file, filename = `${urlLastPart(location.pathname)} ${document.title}.md`) {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(file);
    anchor.download = filename;
    anchor.style["display"] = "none";
    document.body.append(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(anchor.href);
    }, 0);
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

  // src/utils/parseHeader.ts
  function parseHeader(headers) {
    const ret = /* @__PURE__ */ new Map();
    for (const line of headers.split("\r\n")) {
      if (!line) {
        continue;
      }
      const match = /^(.+?): ?(.+)$/.exec(line);
      if (!match) {
        throw new Error(`malformed header: ${line}`);
      }
      const [, key, value] = match;
      if (!ret.has(key)) {
        ret.set(key, []);
      }
      ret.get(key).push(value);
    }
    return ret;
  }

  // src/utils/loadImageCORS.ts
  async function loadImageCORS(url) {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url,
        // https://github.com/greasemonkey/greasemonkey/issues/1834#issuecomment-37084558
        overrideMimeType: "text/plain; charset=x-user-defined",
        onload: async ({ responseText, responseHeaders }) => {
          let objectUrl;
          try {
            const headers = parseHeader(responseHeaders);
            const u8 = new Uint8Array(responseText.length);
            for (let i = 0; i < responseText.length; i++) {
              u8[i] = responseText.charCodeAt(i);
            }
            const data = new Blob([u8], {
              type: headers.get("content-type")?.[0] ?? "image/jpeg"
            });
            objectUrl = URL.createObjectURL(data);
            const img = new Image();
            img.src = objectUrl;
            img.alt = url;
            await img.decode();
            resolve(img);
          } catch (err) {
            reject(err);
          } finally {
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
            }
          }
        },
        onerror: (response) => {
          reject(response);
        }
      });
    });
  }

  // src/utils/sleep.ts
  async function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  // src/syosetu.com/download.user.ts
  var __name__ = "小説家になろう book downloader";
  var statusIndicator = document.createElement("span");
  var finishedCount = 0;
  var totalCount = 0;
  function log(...v) {
    console.log(`${__name__}:`, ...v);
  }
  var messageNodes = [];
  function addMessage(text, title, color = "red") {
    const div = document.createElement("div");
    div.className = `ui ${color} message`;
    statusIndicator.after(div);
    messageNodes.push(div);
    if (title) {
      const header = document.createElement("div");
      header.innerText = title;
      header.className = "header";
      div.appendChild(header);
    }
    const lines = (typeof text === "string" ? [text] : text) || [];
    for (const i of lines) {
      const p = document.createElement("p");
      p.innerText = i;
      div.appendChild(p);
    }
  }
  async function chapterImageToMarkdown(line) {
    const match = line.match(/^<(.+)\|(.+)>$/);
    if (match) {
      const url = `https://${match[2]}.mitemin.net/userpageimage/viewimagebig/icode/${match[1]}/`;
      try {
        return imageToMarkdown(await loadImageCORS(url));
      } catch (err) {
        addMessage([url, JSON.stringify(err)], "Image download failed", "orange");
        return `![${line}](${url})`;
      }
    }
    return line;
  }
  function updateStatus() {
    statusIndicator.innerText = `(${finishedCount}/${totalCount})`;
  }
  async function downloadChapter(ncode, chapter) {
    const url = `https://${location.host}/txtdownload/dlstart/ncode/${ncode}/?no=${chapter}&hankaku=0&code=utf-8&kaigyo=lf`;
    log(`fetch chapter: ${chapter}: ${url}`);
    const resp = await fetch(url);
    if (resp.status !== 200) {
      addMessage(
        [`${resp.status} ${resp.statusText}`, url],
        "Fetch chapter failed"
      );
      throw new Error(
        `Fetch chapter failed: ${resp.status} ${resp.statusText} : ${url}`
      );
    }
    return await resp.text();
  }
  function clearMessage() {
    while (messageNodes.length) {
      messageNodes.pop()?.remove();
    }
  }
  function getMetaData() {
    const data = {
      link: document.location.href
    };
    const authorContainer = document.querySelector(".novel_writername");
    const authorAnchor = document.querySelector(
      ".novel_writername > a:nth-child(1)"
    );
    if (authorAnchor instanceof HTMLAnchorElement) {
      data["author"] = authorAnchor.innerText;
      data["author_link"] = authorAnchor.href;
    } else if (authorContainer instanceof HTMLDivElement) {
      data["author"] = authorContainer.innerText.replace(/^作者：/, "");
    }
    return [
      "---",
      ...Object.entries(data).map(([k, v]) => `${k}: ${v}`),
      "---"
    ].join("\n");
  }
  async function downloadChapterChunk(ncode, chapters) {
    return Promise.all(
      chapters.map(
        (i) => (async function() {
          const ret = await Promise.all(
            (await downloadChapter(ncode, i.chapter)).split("\n").map((i2) => i2.trim()).filter((i2) => i2.length > 0).map(chapterImageToMarkdown)
          );
          ret.splice(0, 0, `# ${i.title}`);
          finishedCount += 1;
          updateStatus();
          return ret;
        })()
      )
    ).then((i) => {
      const ret = [];
      i.map((j) => {
        ret.push(...j);
      });
      return ret;
    });
  }
  async function main(button) {
    clearMessage();
    const link = document.querySelector(
      "#novel_footer > ul:nth-child(1) > li:nth-child(3) > a:nth-child(1)"
    );
    if (!link) {
      throw new Error("Link not found");
    }
    const ncode = urlLastPart(link.href);
    log(`start downloading: ${ncode}`);
    const chapters = [];
    for (const i of document.querySelectorAll(
      "dl.novel_sublist2 > dd:nth-child(1) > a:nth-child(1)"
    )) {
      chapters.push({ chapter: urlLastPart(i.href), title: i.innerText });
    }
    finishedCount = 0;
    totalCount = chapters.length;
    updateStatus();
    const lines = [];
    const chunkSize = 10;
    for (let i = 0; i < chapters.length; i += chunkSize) {
      lines.push(
        ...await downloadChapterChunk(ncode, chapters.slice(i, i + chunkSize))
      );
      await sleep(5e3);
    }
    log(`got ${lines.length} lines`);
    function download() {
      downloadFile(
        new Blob([getMetaData(), "\n\n", lines.join("\n\n")], {
          type: "text/markdown"
        })
      );
    }
    button.onclick = download;
    download();
  }
  (async function() {
    const button = document.createElement("button");
    button.innerText = "Download all chapters";
    button.className = "button";
    button.onclick = async () => {
      try {
        button.disabled = true;
        button.style.opacity = "50%";
        await main(button);
      } catch (err) {
        console.error(err);
      } finally {
        button.disabled = false;
        button.style.opacity = "";
      }
    };
    const target = document.querySelector("#novel_ex");
    if (target) {
      target.after(button, statusIndicator);
      log("activated");
    }
  })();
})();
