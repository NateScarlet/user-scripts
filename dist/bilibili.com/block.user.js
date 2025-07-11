// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 隐藏不感兴趣的内容，支持用户、首页频道推广和广告。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @include	 https://live.bilibili.com/*
// @run-at   document-start
// @version   2025.06.28+700d0a9a
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
  var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __publicField = (obj, key2, value) => {
    __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
    return value;
  };
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

  // src/utils/onDocumentReadyOnce.ts
  function onDocumentReadyOnce(cb) {
    if (document.readyState == "complete") {
      cb();
    } else {
      window.addEventListener("load", cb, { once: true });
    }
  }

  // src/utils/Polling.ts
  var Polling = class {
    constructor({
      update,
      scheduleNext = requestAnimationFrame
    }) {
      __publicField(this, "update");
      __publicField(this, "scheduleNext");
      __publicField(this, "didRequestedStop", false);
      __publicField(this, "workerCount", 0);
      __publicField(this, "start", () => {
        this.didRequestedStop = false;
        if (this.isRunning) {
          return;
        }
        this.run();
      });
      __publicField(this, "stop", () => {
        this.didRequestedStop = true;
      });
      __publicField(this, "dispose", () => {
        this.stop();
      });
      this.update = update;
      this.scheduleNext = scheduleNext;
      this.start();
    }
    run() {
      return __async(this, null, function* () {
        this.workerCount += 1;
        try {
          while (!this.didRequestedStop) {
            yield this.update();
            yield new Promise((resolve) => {
              this.scheduleNext(resolve);
            });
          }
        } finally {
          this.workerCount -= 1;
        }
      });
    }
    get isRunning() {
      return this.workerCount > 0;
    }
  };

  // src/utils/Disposal.ts
  var Disposal = class {
    constructor() {
      __publicField(this, "filo", []);
      __publicField(this, "push", (d2) => {
        this.filo.push(d2);
      });
      __publicField(this, "dispose", () => {
        while (this.filo.length > 0) {
          const next = this.filo.pop();
          if (next) {
            next.dispose();
          }
        }
      });
    }
  };

  // src/utils/waitUntil.ts
  function waitUntil(_0) {
    return __async(this, arguments, function* ({
      ready,
      timeoutMs = 6e4,
      debounceMs = 500,
      onTimeout = () => {
        throw new Error("wait timeout");
      },
      scheduleNext = (next) => setTimeout(next, 100)
    }) {
      const startAt = performance.now();
      let readyAt = 0;
      do {
        if (yield ready()) {
          if (!readyAt) {
            readyAt = performance.now();
          }
        } else {
          readyAt = 0;
        }
        yield new Promise((resolve) => {
          scheduleNext(resolve);
        });
        if (performance.now() - startAt > timeoutMs) {
          return onTimeout();
        }
      } while (readyAt === 0 || performance.now() - readyAt <= debounceMs);
    });
  }

  // src/utils/obtainHTMLElementByID.ts
  function obtainHTMLElementByID({
    tag: tag2,
    id,
    onDidCreate
  }) {
    const match = document.getElementById(id);
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.id = id;
    onDidCreate == null ? void 0 : onDidCreate(el);
    return el;
  }

  // src/utils/randomUUID.ts
  function fallback() {
    const ts = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (ts + Math.random()) * 16 % 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function randomUUID() {
    if (window.isSecureContext && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return fallback();
  }

  // node_modules/.pnpm/@mdi+js@7.4.47/node_modules/@mdi/js/mdi.js
  var mdiAccountCancelOutline = "M10 4A4 4 0 0 0 6 8A4 4 0 0 0 10 12A4 4 0 0 0 14 8A4 4 0 0 0 10 4M10 6A2 2 0 0 1 12 8A2 2 0 0 1 10 10A2 2 0 0 1 8 8A2 2 0 0 1 10 6M10 13C7.33 13 2 14.33 2 17V20H11.5A6.5 6.5 0 0 1 11.03 18.1H3.9V17C3.9 16.36 7.03 14.9 10 14.9C10.5 14.9 11 14.95 11.5 15.03A6.5 6.5 0 0 1 12.55 13.29C11.61 13.1 10.71 13 10 13M17.5 13C15 13 13 15 13 17.5C13 20 15 22 17.5 22C20 22 22 20 22 17.5C22 15 20 13 17.5 13M17.5 14.5C19.16 14.5 20.5 15.84 20.5 17.5C20.5 18.06 20.35 18.58 20.08 19L16 14.92C16.42 14.65 16.94 14.5 17.5 14.5M14.92 16L19 20.08C18.58 20.35 18.06 20.5 17.5 20.5C15.84 20.5 14.5 19.16 14.5 17.5C14.5 16.94 14.65 16.42 14.92 16Z";
  var mdiAccountCheckOutline = "M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4M11,6A2,2 0 0,0 9,8A2,2 0 0,0 11,10A2,2 0 0,0 13,8A2,2 0 0,0 11,6M11,13C11.68,13 12.5,13.09 13.41,13.26L11.74,14.93L11,14.9C8.03,14.9 4.9,16.36 4.9,17V18.1H11.1L13,20H3V17C3,14.34 8.33,13 11,13Z";
  var mdiCancel = "M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z";
  var mdiCheck = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
  var mdiCheckCircleOutline = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z";
  var mdiClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
  var mdiEyeOff = "M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z";
  var mdiEyeOffOutline = "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z";
  var mdiOpenInNew = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z";

  // node_modules/.pnpm/lit-html@2.8.0/node_modules/lit-html/development/lit-html.js
  var _a;
  var _b;
  var _c;
  var _d;
  var DEV_MODE = false;
  var ENABLE_EXTRA_SECURITY_HOOKS = true;
  var ENABLE_SHADYDOM_NOPATCH = true;
  var NODE_MODE = false;
  var global2 = NODE_MODE ? globalThis : window;
  var debugLogEvent = DEV_MODE ? (event) => {
    const shouldEmit = global2.emitLitDebugLogEvents;
    if (!shouldEmit) {
      return;
    }
    global2.dispatchEvent(new CustomEvent("lit-debug", {
      detail: event
    }));
  } : void 0;
  var debugLogRenderId = 0;
  var issueWarning;
  if (DEV_MODE) {
    (_a = global2.litIssuedWarnings) !== null && _a !== void 0 ? _a : global2.litIssuedWarnings = /* @__PURE__ */ new Set();
    issueWarning = (code, warning) => {
      warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
      if (!global2.litIssuedWarnings.has(warning)) {
        console.warn(warning);
        global2.litIssuedWarnings.add(warning);
      }
    };
    issueWarning("dev-mode", `Lit is in dev mode. Not recommended for production!`);
  }
  var wrap = ENABLE_SHADYDOM_NOPATCH && ((_b = global2.ShadyDOM) === null || _b === void 0 ? void 0 : _b.inUse) && ((_c = global2.ShadyDOM) === null || _c === void 0 ? void 0 : _c.noPatch) === true ? global2.ShadyDOM.wrap : (node) => node;
  var trustedTypes = global2.trustedTypes;
  var policy = trustedTypes ? trustedTypes.createPolicy("lit-html", {
    createHTML: (s) => s
  }) : void 0;
  var identityFunction = (value) => value;
  var noopSanitizer = (_node, _name, _type) => identityFunction;
  var setSanitizer = (newSanitizer) => {
    if (!ENABLE_EXTRA_SECURITY_HOOKS) {
      return;
    }
    if (sanitizerFactoryInternal !== noopSanitizer) {
      throw new Error(`Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.`);
    }
    sanitizerFactoryInternal = newSanitizer;
  };
  var _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
    sanitizerFactoryInternal = noopSanitizer;
  };
  var createSanitizer = (node, name, type) => {
    return sanitizerFactoryInternal(node, name, type);
  };
  var boundAttributeSuffix = "$lit$";
  var marker = `lit$${String(Math.random()).slice(9)}$`;
  var markerMatch = "?" + marker;
  var nodeMarker = `<${markerMatch}>`;
  var d = NODE_MODE && global2.document === void 0 ? {
    createTreeWalker() {
      return {};
    }
  } : document;
  var createMarker = () => d.createComment("");
  var isPrimitive = (value) => value === null || typeof value != "object" && typeof value != "function";
  var isArray = Array.isArray;
  var isIterable = (value) => isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof (value === null || value === void 0 ? void 0 : value[Symbol.iterator]) === "function";
  var SPACE_CHAR = `[ 	
\f\r]`;
  var ATTR_VALUE_CHAR = `[^ 	
\f\r"'\`<>=]`;
  var NAME_CHAR = `[^\\s"'>=/]`;
  var textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var COMMENT_START = 1;
  var TAG_NAME = 2;
  var DYNAMIC_TAG_NAME = 3;
  var commentEndRegex = /-->/g;
  var comment2EndRegex = />/g;
  var tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
  var ENTIRE_MATCH = 0;
  var ATTRIBUTE_NAME = 1;
  var SPACES_AND_EQUALS = 2;
  var QUOTE_CHAR = 3;
  var singleQuoteAttrEndRegex = /'/g;
  var doubleQuoteAttrEndRegex = /"/g;
  var rawTextElement = /^(?:script|style|textarea|title)$/i;
  var HTML_RESULT = 1;
  var SVG_RESULT = 2;
  var ATTRIBUTE_PART = 1;
  var CHILD_PART = 2;
  var PROPERTY_PART = 3;
  var BOOLEAN_ATTRIBUTE_PART = 4;
  var EVENT_PART = 5;
  var ELEMENT_PART = 6;
  var COMMENT_PART = 7;
  var tag = (type) => (strings, ...values) => {
    if (DEV_MODE && strings.some((s) => s === void 0)) {
      console.warn("Some template strings are undefined.\nThis is probably caused by illegal octal escape sequences.");
    }
    return {
      // This property needs to remain unminified.
      ["_$litType$"]: type,
      strings,
      values
    };
  };
  var html = tag(HTML_RESULT);
  var svg = tag(SVG_RESULT);
  var noChange = Symbol.for("lit-noChange");
  var nothing = Symbol.for("lit-nothing");
  var templateCache = /* @__PURE__ */ new WeakMap();
  var walker = d.createTreeWalker(d, 129, null, false);
  var sanitizerFactoryInternal = noopSanitizer;
  function trustFromTemplateString(tsa, stringFromTSA) {
    if (!Array.isArray(tsa) || !tsa.hasOwnProperty("raw")) {
      let message = "invalid template strings array";
      if (DEV_MODE) {
        message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, "\n");
      }
      throw new Error(message);
    }
    return policy !== void 0 ? policy.createHTML(stringFromTSA) : stringFromTSA;
  }
  var getTemplateHtml = (strings, type) => {
    const l = strings.length - 1;
    const attrNames = [];
    let html2 = type === SVG_RESULT ? "<svg>" : "";
    let rawTextEndRegex;
    let regex = textEndRegex;
    for (let i = 0; i < l; i++) {
      const s = strings[i];
      let attrNameEndIndex = -1;
      let attrName;
      let lastIndex = 0;
      let match;
      while (lastIndex < s.length) {
        regex.lastIndex = lastIndex;
        match = regex.exec(s);
        if (match === null) {
          break;
        }
        lastIndex = regex.lastIndex;
        if (regex === textEndRegex) {
          if (match[COMMENT_START] === "!--") {
            regex = commentEndRegex;
          } else if (match[COMMENT_START] !== void 0) {
            regex = comment2EndRegex;
          } else if (match[TAG_NAME] !== void 0) {
            if (rawTextElement.test(match[TAG_NAME])) {
              rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
            }
            regex = tagEndRegex;
          } else if (match[DYNAMIC_TAG_NAME] !== void 0) {
            if (DEV_MODE) {
              throw new Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions");
            }
            regex = tagEndRegex;
          }
        } else if (regex === tagEndRegex) {
          if (match[ENTIRE_MATCH] === ">") {
            regex = rawTextEndRegex !== null && rawTextEndRegex !== void 0 ? rawTextEndRegex : textEndRegex;
            attrNameEndIndex = -1;
          } else if (match[ATTRIBUTE_NAME] === void 0) {
            attrNameEndIndex = -2;
          } else {
            attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
            attrName = match[ATTRIBUTE_NAME];
            regex = match[QUOTE_CHAR] === void 0 ? tagEndRegex : match[QUOTE_CHAR] === '"' ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
          }
        } else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) {
          regex = tagEndRegex;
        } else if (regex === commentEndRegex || regex === comment2EndRegex) {
          regex = textEndRegex;
        } else {
          regex = tagEndRegex;
          rawTextEndRegex = void 0;
        }
      }
      if (DEV_MODE) {
        console.assert(attrNameEndIndex === -1 || regex === tagEndRegex || regex === singleQuoteAttrEndRegex || regex === doubleQuoteAttrEndRegex, "unexpected parse state B");
      }
      const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
      html2 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker + end : s + marker + (attrNameEndIndex === -2 ? (attrNames.push(void 0), i) : end);
    }
    const htmlResult = html2 + (strings[l] || "<?>") + (type === SVG_RESULT ? "</svg>" : "");
    return [trustFromTemplateString(strings, htmlResult), attrNames];
  };
  var Template = class _Template {
    constructor({ strings, ["_$litType$"]: type }, options) {
      this.parts = [];
      let node;
      let nodeIndex = 0;
      let attrNameIndex = 0;
      const partCount = strings.length - 1;
      const parts = this.parts;
      const [html2, attrNames] = getTemplateHtml(strings, type);
      this.el = _Template.createElement(html2, options);
      walker.currentNode = this.el.content;
      if (type === SVG_RESULT) {
        const content = this.el.content;
        const svgElement = content.firstChild;
        svgElement.remove();
        content.append(...svgElement.childNodes);
      }
      while ((node = walker.nextNode()) !== null && parts.length < partCount) {
        if (node.nodeType === 1) {
          if (DEV_MODE) {
            const tag2 = node.localName;
            if (/^(?:textarea|template)$/i.test(tag2) && node.innerHTML.includes(marker)) {
              const m = `Expressions are not supported inside \`${tag2}\` elements. See https://lit.dev/msg/expression-in-${tag2} for more information.`;
              if (tag2 === "template") {
                throw new Error(m);
              } else
                issueWarning("", m);
            }
          }
          if (node.hasAttributes()) {
            const attrsToRemove = [];
            for (const name of node.getAttributeNames()) {
              if (name.endsWith(boundAttributeSuffix) || name.startsWith(marker)) {
                const realName = attrNames[attrNameIndex++];
                attrsToRemove.push(name);
                if (realName !== void 0) {
                  const value = node.getAttribute(realName.toLowerCase() + boundAttributeSuffix);
                  const statics = value.split(marker);
                  const m = /([.?@])?(.*)/.exec(realName);
                  parts.push({
                    type: ATTRIBUTE_PART,
                    index: nodeIndex,
                    name: m[2],
                    strings: statics,
                    ctor: m[1] === "." ? PropertyPart : m[1] === "?" ? BooleanAttributePart : m[1] === "@" ? EventPart : AttributePart
                  });
                } else {
                  parts.push({
                    type: ELEMENT_PART,
                    index: nodeIndex
                  });
                }
              }
            }
            for (const name of attrsToRemove) {
              node.removeAttribute(name);
            }
          }
          if (rawTextElement.test(node.tagName)) {
            const strings2 = node.textContent.split(marker);
            const lastIndex = strings2.length - 1;
            if (lastIndex > 0) {
              node.textContent = trustedTypes ? trustedTypes.emptyScript : "";
              for (let i = 0; i < lastIndex; i++) {
                node.append(strings2[i], createMarker());
                walker.nextNode();
                parts.push({ type: CHILD_PART, index: ++nodeIndex });
              }
              node.append(strings2[lastIndex], createMarker());
            }
          }
        } else if (node.nodeType === 8) {
          const data = node.data;
          if (data === markerMatch) {
            parts.push({ type: CHILD_PART, index: nodeIndex });
          } else {
            let i = -1;
            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              parts.push({ type: COMMENT_PART, index: nodeIndex });
              i += marker.length - 1;
            }
          }
        }
        nodeIndex++;
      }
      debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
        kind: "template prep",
        template: this,
        clonableTemplate: this.el,
        parts: this.parts,
        strings
      });
    }
    // Overridden via `litHtmlPolyfillSupport` to provide platform support.
    /** @nocollapse */
    static createElement(html2, _options) {
      const el = d.createElement("template");
      el.innerHTML = html2;
      return el;
    }
  };
  function resolveDirective(part, value, parent = part, attributeIndex) {
    var _a2, _b2, _c2;
    var _d2;
    if (value === noChange) {
      return value;
    }
    let currentDirective = attributeIndex !== void 0 ? (_a2 = parent.__directives) === null || _a2 === void 0 ? void 0 : _a2[attributeIndex] : parent.__directive;
    const nextDirectiveConstructor = isPrimitive(value) ? void 0 : (
      // This property needs to remain unminified.
      value["_$litDirective$"]
    );
    if ((currentDirective === null || currentDirective === void 0 ? void 0 : currentDirective.constructor) !== nextDirectiveConstructor) {
      (_b2 = currentDirective === null || currentDirective === void 0 ? void 0 : currentDirective["_$notifyDirectiveConnectionChanged"]) === null || _b2 === void 0 ? void 0 : _b2.call(currentDirective, false);
      if (nextDirectiveConstructor === void 0) {
        currentDirective = void 0;
      } else {
        currentDirective = new nextDirectiveConstructor(part);
        currentDirective._$initialize(part, parent, attributeIndex);
      }
      if (attributeIndex !== void 0) {
        ((_c2 = (_d2 = parent).__directives) !== null && _c2 !== void 0 ? _c2 : _d2.__directives = [])[attributeIndex] = currentDirective;
      } else {
        parent.__directive = currentDirective;
      }
    }
    if (currentDirective !== void 0) {
      value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
    }
    return value;
  }
  var TemplateInstance = class {
    constructor(template, parent) {
      this._$parts = [];
      this._$disconnectableChildren = void 0;
      this._$template = template;
      this._$parent = parent;
    }
    // Called by ChildPart parentNode getter
    get parentNode() {
      return this._$parent.parentNode;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
      return this._$parent._$isConnected;
    }
    // This method is separate from the constructor because we need to return a
    // DocumentFragment and we don't want to hold onto it with an instance field.
    _clone(options) {
      var _a2;
      const { el: { content }, parts } = this._$template;
      const fragment = ((_a2 = options === null || options === void 0 ? void 0 : options.creationScope) !== null && _a2 !== void 0 ? _a2 : d).importNode(content, true);
      walker.currentNode = fragment;
      let node = walker.nextNode();
      let nodeIndex = 0;
      let partIndex = 0;
      let templatePart = parts[0];
      while (templatePart !== void 0) {
        if (nodeIndex === templatePart.index) {
          let part;
          if (templatePart.type === CHILD_PART) {
            part = new ChildPart(node, node.nextSibling, this, options);
          } else if (templatePart.type === ATTRIBUTE_PART) {
            part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
          } else if (templatePart.type === ELEMENT_PART) {
            part = new ElementPart(node, this, options);
          }
          this._$parts.push(part);
          templatePart = parts[++partIndex];
        }
        if (nodeIndex !== (templatePart === null || templatePart === void 0 ? void 0 : templatePart.index)) {
          node = walker.nextNode();
          nodeIndex++;
        }
      }
      walker.currentNode = d;
      return fragment;
    }
    _update(values) {
      let i = 0;
      for (const part of this._$parts) {
        if (part !== void 0) {
          debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
            kind: "set part",
            part,
            value: values[i],
            valueIndex: i,
            values,
            templateInstance: this
          });
          if (part.strings !== void 0) {
            part._$setValue(values, part, i);
            i += part.strings.length - 2;
          } else {
            part._$setValue(values[i]);
          }
        }
        i++;
      }
    }
  };
  var ChildPart = class _ChildPart {
    constructor(startNode, endNode, parent, options) {
      var _a2;
      this.type = CHILD_PART;
      this._$committedValue = nothing;
      this._$disconnectableChildren = void 0;
      this._$startNode = startNode;
      this._$endNode = endNode;
      this._$parent = parent;
      this.options = options;
      this.__isConnected = (_a2 = options === null || options === void 0 ? void 0 : options.isConnected) !== null && _a2 !== void 0 ? _a2 : true;
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        this._textSanitizer = void 0;
      }
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
      var _a2, _b2;
      return (_b2 = (_a2 = this._$parent) === null || _a2 === void 0 ? void 0 : _a2._$isConnected) !== null && _b2 !== void 0 ? _b2 : this.__isConnected;
    }
    /**
     * The parent node into which the part renders its content.
     *
     * A ChildPart's content consists of a range of adjacent child nodes of
     * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
     * `.endNode`).
     *
     * - If both `.startNode` and `.endNode` are non-null, then the part's content
     * consists of all siblings between `.startNode` and `.endNode`, exclusively.
     *
     * - If `.startNode` is non-null but `.endNode` is null, then the part's
     * content consists of all siblings following `.startNode`, up to and
     * including the last child of `.parentNode`. If `.endNode` is non-null, then
     * `.startNode` will always be non-null.
     *
     * - If both `.endNode` and `.startNode` are null, then the part's content
     * consists of all child nodes of `.parentNode`.
     */
    get parentNode() {
      let parentNode = wrap(this._$startNode).parentNode;
      const parent = this._$parent;
      if (parent !== void 0 && (parentNode === null || parentNode === void 0 ? void 0 : parentNode.nodeType) === 11) {
        parentNode = parent.parentNode;
      }
      return parentNode;
    }
    /**
     * The part's leading marker node, if any. See `.parentNode` for more
     * information.
     */
    get startNode() {
      return this._$startNode;
    }
    /**
     * The part's trailing marker node, if any. See `.parentNode` for more
     * information.
     */
    get endNode() {
      return this._$endNode;
    }
    _$setValue(value, directiveParent = this) {
      var _a2;
      if (DEV_MODE && this.parentNode === null) {
        throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
      }
      value = resolveDirective(this, value, directiveParent);
      if (isPrimitive(value)) {
        if (value === nothing || value == null || value === "") {
          if (this._$committedValue !== nothing) {
            debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
              kind: "commit nothing to child",
              start: this._$startNode,
              end: this._$endNode,
              parent: this._$parent,
              options: this.options
            });
            this._$clear();
          }
          this._$committedValue = nothing;
        } else if (value !== this._$committedValue && value !== noChange) {
          this._commitText(value);
        }
      } else if (value["_$litType$"] !== void 0) {
        this._commitTemplateResult(value);
      } else if (value.nodeType !== void 0) {
        if (DEV_MODE && ((_a2 = this.options) === null || _a2 === void 0 ? void 0 : _a2.host) === value) {
          this._commitText(`[probable mistake: rendered a template's host in itself (commonly caused by writing \${this} in a template]`);
          console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
          return;
        }
        this._commitNode(value);
      } else if (isIterable(value)) {
        this._commitIterable(value);
      } else {
        this._commitText(value);
      }
    }
    _insert(node) {
      return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
    }
    _commitNode(value) {
      var _a2;
      if (this._$committedValue !== value) {
        this._$clear();
        if (ENABLE_EXTRA_SECURITY_HOOKS && sanitizerFactoryInternal !== noopSanitizer) {
          const parentNodeName = (_a2 = this._$startNode.parentNode) === null || _a2 === void 0 ? void 0 : _a2.nodeName;
          if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
            let message = "Forbidden";
            if (DEV_MODE) {
              if (parentNodeName === "STYLE") {
                message = `Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css\`...\` literals to compose styles, and make do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.`;
              } else {
                message = `Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.`;
              }
            }
            throw new Error(message);
          }
        }
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "commit node",
          start: this._$startNode,
          parent: this._$parent,
          value,
          options: this.options
        });
        this._$committedValue = this._insert(value);
      }
    }
    _commitText(value) {
      if (this._$committedValue !== nothing && isPrimitive(this._$committedValue)) {
        const node = wrap(this._$startNode).nextSibling;
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
          if (this._textSanitizer === void 0) {
            this._textSanitizer = createSanitizer(node, "data", "property");
          }
          value = this._textSanitizer(value);
        }
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "commit text",
          node,
          value,
          options: this.options
        });
        node.data = value;
      } else {
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
          const textNode = d.createTextNode("");
          this._commitNode(textNode);
          if (this._textSanitizer === void 0) {
            this._textSanitizer = createSanitizer(textNode, "data", "property");
          }
          value = this._textSanitizer(value);
          debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
            kind: "commit text",
            node: textNode,
            value,
            options: this.options
          });
          textNode.data = value;
        } else {
          this._commitNode(d.createTextNode(value));
          debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
            kind: "commit text",
            node: wrap(this._$startNode).nextSibling,
            value,
            options: this.options
          });
        }
      }
      this._$committedValue = value;
    }
    _commitTemplateResult(result) {
      var _a2;
      const { values, ["_$litType$"]: type } = result;
      const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === void 0 && (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)), type);
      if (((_a2 = this._$committedValue) === null || _a2 === void 0 ? void 0 : _a2._$template) === template) {
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "template updating",
          template,
          instance: this._$committedValue,
          parts: this._$committedValue._$parts,
          options: this.options,
          values
        });
        this._$committedValue._update(values);
      } else {
        const instance = new TemplateInstance(template, this);
        const fragment = instance._clone(this.options);
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "template instantiated",
          template,
          instance,
          parts: instance._$parts,
          options: this.options,
          fragment,
          values
        });
        instance._update(values);
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "template instantiated and updated",
          template,
          instance,
          parts: instance._$parts,
          options: this.options,
          fragment,
          values
        });
        this._commitNode(fragment);
        this._$committedValue = instance;
      }
    }
    // Overridden via `litHtmlPolyfillSupport` to provide platform support.
    /** @internal */
    _$getTemplate(result) {
      let template = templateCache.get(result.strings);
      if (template === void 0) {
        templateCache.set(result.strings, template = new Template(result));
      }
      return template;
    }
    _commitIterable(value) {
      if (!isArray(this._$committedValue)) {
        this._$committedValue = [];
        this._$clear();
      }
      const itemParts = this._$committedValue;
      let partIndex = 0;
      let itemPart;
      for (const item of value) {
        if (partIndex === itemParts.length) {
          itemParts.push(itemPart = new _ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
        } else {
          itemPart = itemParts[partIndex];
        }
        itemPart._$setValue(item);
        partIndex++;
      }
      if (partIndex < itemParts.length) {
        this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
        itemParts.length = partIndex;
      }
    }
    /**
     * Removes the nodes contained within this Part from the DOM.
     *
     * @param start Start node to clear from, for clearing a subset of the part's
     *     DOM (used when truncating iterables)
     * @param from  When `start` is specified, the index within the iterable from
     *     which ChildParts are being removed, used for disconnecting directives in
     *     those Parts.
     *
     * @internal
     */
    _$clear(start = wrap(this._$startNode).nextSibling, from) {
      var _a2;
      (_a2 = this._$notifyConnectionChanged) === null || _a2 === void 0 ? void 0 : _a2.call(this, false, true, from);
      while (start && start !== this._$endNode) {
        const n = wrap(start).nextSibling;
        wrap(start).remove();
        start = n;
      }
    }
    /**
     * Implementation of RootPart's `isConnected`. Note that this metod
     * should only be called on `RootPart`s (the `ChildPart` returned from a
     * top-level `render()` call). It has no effect on non-root ChildParts.
     * @param isConnected Whether to set
     * @internal
     */
    setConnected(isConnected) {
      var _a2;
      if (this._$parent === void 0) {
        this.__isConnected = isConnected;
        (_a2 = this._$notifyConnectionChanged) === null || _a2 === void 0 ? void 0 : _a2.call(this, isConnected);
      } else if (DEV_MODE) {
        throw new Error("part.setConnected() may only be called on a RootPart returned from render().");
      }
    }
  };
  var AttributePart = class {
    constructor(element, name, strings, parent, options) {
      this.type = ATTRIBUTE_PART;
      this._$committedValue = nothing;
      this._$disconnectableChildren = void 0;
      this.element = element;
      this.name = name;
      this._$parent = parent;
      this.options = options;
      if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
        this._$committedValue = new Array(strings.length - 1).fill(new String());
        this.strings = strings;
      } else {
        this._$committedValue = nothing;
      }
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        this._sanitizer = void 0;
      }
    }
    get tagName() {
      return this.element.tagName;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
      return this._$parent._$isConnected;
    }
    /**
     * Sets the value of this part by resolving the value from possibly multiple
     * values and static strings and committing it to the DOM.
     * If this part is single-valued, `this._strings` will be undefined, and the
     * method will be called with a single value argument. If this part is
     * multi-value, `this._strings` will be defined, and the method is called
     * with the value array of the part's owning TemplateInstance, and an offset
     * into the value array from which the values should be read.
     * This method is overloaded this way to eliminate short-lived array slices
     * of the template instance values, and allow a fast-path for single-valued
     * parts.
     *
     * @param value The part value, or an array of values for multi-valued parts
     * @param valueIndex the index to start reading values from. `undefined` for
     *   single-valued parts
     * @param noCommit causes the part to not commit its value to the DOM. Used
     *   in hydration to prime attribute parts with their first-rendered value,
     *   but not set the attribute, and in SSR to no-op the DOM operation and
     *   capture the value for serialization.
     *
     * @internal
     */
    _$setValue(value, directiveParent = this, valueIndex, noCommit) {
      const strings = this.strings;
      let change = false;
      if (strings === void 0) {
        value = resolveDirective(this, value, directiveParent, 0);
        change = !isPrimitive(value) || value !== this._$committedValue && value !== noChange;
        if (change) {
          this._$committedValue = value;
        }
      } else {
        const values = value;
        value = strings[0];
        let i, v;
        for (i = 0; i < strings.length - 1; i++) {
          v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
          if (v === noChange) {
            v = this._$committedValue[i];
          }
          change || (change = !isPrimitive(v) || v !== this._$committedValue[i]);
          if (v === nothing) {
            value = nothing;
          } else if (value !== nothing) {
            value += (v !== null && v !== void 0 ? v : "") + strings[i + 1];
          }
          this._$committedValue[i] = v;
        }
      }
      if (change && !noCommit) {
        this._commitValue(value);
      }
    }
    /** @internal */
    _commitValue(value) {
      if (value === nothing) {
        wrap(this.element).removeAttribute(this.name);
      } else {
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
          if (this._sanitizer === void 0) {
            this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "attribute");
          }
          value = this._sanitizer(value !== null && value !== void 0 ? value : "");
        }
        debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
          kind: "commit attribute",
          element: this.element,
          name: this.name,
          value,
          options: this.options
        });
        wrap(this.element).setAttribute(this.name, value !== null && value !== void 0 ? value : "");
      }
    }
  };
  var PropertyPart = class extends AttributePart {
    constructor() {
      super(...arguments);
      this.type = PROPERTY_PART;
    }
    /** @internal */
    _commitValue(value) {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._sanitizer === void 0) {
          this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "property");
        }
        value = this._sanitizer(value);
      }
      debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
        kind: "commit property",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      this.element[this.name] = value === nothing ? void 0 : value;
    }
  };
  var emptyStringForBooleanAttribute = trustedTypes ? trustedTypes.emptyScript : "";
  var BooleanAttributePart = class extends AttributePart {
    constructor() {
      super(...arguments);
      this.type = BOOLEAN_ATTRIBUTE_PART;
    }
    /** @internal */
    _commitValue(value) {
      debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
        kind: "commit boolean attribute",
        element: this.element,
        name: this.name,
        value: !!(value && value !== nothing),
        options: this.options
      });
      if (value && value !== nothing) {
        wrap(this.element).setAttribute(this.name, emptyStringForBooleanAttribute);
      } else {
        wrap(this.element).removeAttribute(this.name);
      }
    }
  };
  var EventPart = class extends AttributePart {
    constructor(element, name, strings, parent, options) {
      super(element, name, strings, parent, options);
      this.type = EVENT_PART;
      if (DEV_MODE && this.strings !== void 0) {
        throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`);
      }
    }
    // EventPart does not use the base _$setValue/_resolveValue implementation
    // since the dirty checking is more complex
    /** @internal */
    _$setValue(newListener, directiveParent = this) {
      var _a2;
      newListener = (_a2 = resolveDirective(this, newListener, directiveParent, 0)) !== null && _a2 !== void 0 ? _a2 : nothing;
      if (newListener === noChange) {
        return;
      }
      const oldListener = this._$committedValue;
      const shouldRemoveListener = newListener === nothing && oldListener !== nothing || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
      const shouldAddListener = newListener !== nothing && (oldListener === nothing || shouldRemoveListener);
      debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
        kind: "commit event listener",
        element: this.element,
        name: this.name,
        value: newListener,
        options: this.options,
        removeListener: shouldRemoveListener,
        addListener: shouldAddListener,
        oldListener
      });
      if (shouldRemoveListener) {
        this.element.removeEventListener(this.name, this, oldListener);
      }
      if (shouldAddListener) {
        this.element.addEventListener(this.name, this, newListener);
      }
      this._$committedValue = newListener;
    }
    handleEvent(event) {
      var _a2, _b2;
      if (typeof this._$committedValue === "function") {
        this._$committedValue.call((_b2 = (_a2 = this.options) === null || _a2 === void 0 ? void 0 : _a2.host) !== null && _b2 !== void 0 ? _b2 : this.element, event);
      } else {
        this._$committedValue.handleEvent(event);
      }
    }
  };
  var ElementPart = class {
    constructor(element, parent, options) {
      this.element = element;
      this.type = ELEMENT_PART;
      this._$disconnectableChildren = void 0;
      this._$parent = parent;
      this.options = options;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
      return this._$parent._$isConnected;
    }
    _$setValue(value) {
      debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
        kind: "commit to element binding",
        element: this.element,
        value,
        options: this.options
      });
      resolveDirective(this, value);
    }
  };
  var polyfillSupport = DEV_MODE ? global2.litHtmlPolyfillSupportDevMode : global2.litHtmlPolyfillSupport;
  polyfillSupport === null || polyfillSupport === void 0 ? void 0 : polyfillSupport(Template, ChildPart);
  ((_d = global2.litHtmlVersions) !== null && _d !== void 0 ? _d : global2.litHtmlVersions = []).push("2.8.0");
  if (DEV_MODE && global2.litHtmlVersions.length > 1) {
    issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`);
  }
  var render = (value, container, options) => {
    var _a2, _b2;
    if (DEV_MODE && container == null) {
      throw new TypeError(`The container to render into may not be ${container}`);
    }
    const renderId = DEV_MODE ? debugLogRenderId++ : 0;
    const partOwnerNode = (_a2 = options === null || options === void 0 ? void 0 : options.renderBefore) !== null && _a2 !== void 0 ? _a2 : container;
    let part = partOwnerNode["_$litPart$"];
    debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
      kind: "begin render",
      id: renderId,
      value,
      container,
      options,
      part
    });
    if (part === void 0) {
      const endNode = (_b2 = options === null || options === void 0 ? void 0 : options.renderBefore) !== null && _b2 !== void 0 ? _b2 : null;
      partOwnerNode["_$litPart$"] = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, void 0, options !== null && options !== void 0 ? options : {});
    }
    part._$setValue(value);
    debugLogEvent === null || debugLogEvent === void 0 ? void 0 : debugLogEvent({
      kind: "end render",
      id: renderId,
      value,
      container,
      options,
      part
    });
    return part;
  };
  if (ENABLE_EXTRA_SECURITY_HOOKS) {
    render.setSanitizer = setSanitizer;
    render.createSanitizer = createSanitizer;
    if (DEV_MODE) {
      render._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse;
    }
  }

  // src/utils/compare.ts
  function compare(a, b) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_freeGlobal.js
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeGlobal_default = freeGlobal;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_root.js
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal_default || freeSelf || Function("return this")();
  var root_default = root;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Symbol.js
  var Symbol2 = root_default.Symbol;
  var Symbol_default = Symbol2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getRawTag.js
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag2 = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag2;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getRawTag_default = getRawTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_objectToString.js
  var objectProto2 = Object.prototype;
  var nativeObjectToString2 = objectProto2.toString;
  function objectToString(value) {
    return nativeObjectToString2.call(value);
  }
  var objectToString_default = objectToString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetTag.js
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
  }
  var baseGetTag_default = baseGetTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObjectLike.js
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_default = isObjectLike;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isSymbol.js
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
  }
  var isSymbol_default = isSymbol;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_trimmedEndIndex.js
  var reWhitespace = /\s/;
  function trimmedEndIndex(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) {
    }
    return index;
  }
  var trimmedEndIndex_default = trimmedEndIndex;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseTrim.js
  var reTrimStart = /^\s+/;
  function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
  }
  var baseTrim_default = baseTrim;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObject.js
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_default = isObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toNumber.js
  var NAN = 0 / 0;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  function toNumber(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol_default(value)) {
      return NAN;
    }
    if (isObject_default(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject_default(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = baseTrim_default(value);
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  var toNumber_default = toNumber;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_overArg.js
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  var overArg_default = overArg;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getPrototype.js
  var getPrototype = overArg_default(Object.getPrototypeOf, Object);
  var getPrototype_default = getPrototype;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isPlainObject.js
  var objectTag = "[object Object]";
  var funcProto = Function.prototype;
  var objectProto3 = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty2 = objectProto3.hasOwnProperty;
  var objectCtorString = funcToString.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike_default(value) || baseGetTag_default(value) != objectTag) {
      return false;
    }
    var proto = getPrototype_default(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty2.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  var isPlainObject_default = isPlainObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/now.js
  var now = function() {
    return root_default.Date.now();
  };
  var now_default = now;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/debounce.js
  var FUNC_ERROR_TEXT = "Expected a function";
  var nativeMax = Math.max;
  var nativeMin = Math.min;
  function debounce(func, wait, options) {
    var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber_default(wait) || 0;
    if (isObject_default(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing ? nativeMax(toNumber_default(options.maxWait) || 0, wait) : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
      var args = lastArgs, thisArg = lastThis;
      lastArgs = lastThis = void 0;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }
    function leadingEdge(time) {
      lastInvokeTime = time;
      timerId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
      return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }
    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
      return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }
    function timerExpired() {
      var time = now_default();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
      timerId = void 0;
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = void 0;
      return result;
    }
    function cancel() {
      if (timerId !== void 0) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = void 0;
    }
    function flush() {
      return timerId === void 0 ? result : trailingEdge(now_default());
    }
    function debounced() {
      var time = now_default(), isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;
      if (isInvoking) {
        if (timerId === void 0) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === void 0) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }
  var debounce_default = debounce;

  // src/utils/growTextAreaHeight.ts
  function growTextAreaHeight(el) {
    const maxHeight = Math.min(window.innerHeight, el.scrollHeight);
    if (el.scrollHeight > el.clientHeight && el.clientHeight < maxHeight) {
      el.style.height = `${maxHeight}px`;
    }
  }

  // src/utils/isNonNull.ts
  function isNonNull(v) {
    return v != null;
  }

  // src/utils/GMValue.ts
  var GMValue = class {
    constructor(key2, defaultValue) {
      this.key = key2;
      this.defaultValue = defaultValue;
      __publicField(this, "value");
      __publicField(this, "loadingCount", 0);
      __publicField(this, "currentAction");
      __publicField(this, "polling");
      __publicField(this, "refresh", () => __async(this, null, function* () {
        if (this.isLoading) {
          yield this.currentAction;
          return;
        }
        this.loadingCount += 1;
        this.currentAction = (() => __async(this, null, function* () {
          try {
            const value = yield GM.getValue(this.key);
            if (value != null) {
              try {
                this.value = JSON.parse(String(value));
              } catch (e) {
                this.value = void 0;
              }
            }
          } finally {
            this.loadingCount -= 1;
          }
        }))();
        yield this.currentAction;
      }));
      __publicField(this, "flush", () => __async(this, null, function* () {
        this.loadingCount += 1;
        this.currentAction = (() => __async(this, null, function* () {
          try {
            if (this.value == null) {
              yield GM.deleteValue(this.key);
            } else {
              yield GM.setValue(this.key, JSON.stringify(this.value));
            }
          } finally {
            this.loadingCount -= 1;
          }
        }))();
        yield this.currentAction;
      }));
      __publicField(this, "get", () => {
        var _a2;
        return (_a2 = this.value) != null ? _a2 : this.defaultValue();
      });
      __publicField(this, "set", (v) => {
        this.value = v;
        this.flush();
      });
      __publicField(this, "dispose", () => {
        this.polling.dispose();
      });
      this.polling = new Polling({
        update: () => this.refresh(),
        scheduleNext: (update) => setTimeout(update, 500)
      });
    }
    get isLoading() {
      return this.loadingCount > 0;
    }
  };

  // src/bilibili.com/models/blockedUsers.ts
  var blockedUsers_default = new class {
    constructor() {
      __publicField(this, "value", new GMValue("blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4", () => ({})));
      __publicField(this, "has", (id) => {
        return id in this.value.get();
      });
      __publicField(this, "get", (id) => {
        const value = this.value.get()[id];
        if (!value) {
          return;
        }
        const {
          blockedAt: rawBlockedAt = 0,
          name = id,
          note = ""
        } = typeof value === "boolean" ? {} : value != null ? value : {};
        const blockedAt = new Date(rawBlockedAt);
        return {
          id,
          blockedAt,
          name,
          idAsNumber: Number.parseInt(id, 10),
          rawBlockedAt,
          note
        };
      });
      __publicField(this, "distinctID", () => {
        return Object.keys(this.value.get());
      });
      __publicField(this, "add", ({
        id,
        name,
        note
      }) => {
        if (this.has(id)) {
          return;
        }
        this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
          [id]: {
            name: name.trim(),
            blockedAt: Date.now(),
            note: note || void 0
          }
        }));
      });
      __publicField(this, "update", (id, update) => {
        var _a2;
        const existing = this.get(id);
        if (existing) {
          this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
            [id]: {
              name: update.name || existing.name,
              blockedAt: update.blockedAt || existing.blockedAt.getTime(),
              note: ((_a2 = update.note) != null ? _a2 : existing.note) || void 0
            }
          }));
        }
      });
      __publicField(this, "remove", (id) => {
        if (!this.has(id)) {
          return;
        }
        this.value.set(
          Object.fromEntries(
            Object.entries(this.value.get()).filter(([k]) => k !== id)
          )
        );
      });
      __publicField(this, "toggle", (user, force) => {
        const want = force != null ? force : !this.has(user.id);
        if (want) {
          this.add(user);
        } else {
          this.remove(user.id);
        }
      });
    }
  }();

  // src/bilibili.com/models/homePageSettings.ts
  var homePageSettings_default = new class HomePageSettings {
    constructor() {
      __publicField(this, "value", new GMValue("homePageSettings@cb2f3e6c-a1e5-44de-b618-7715559b02ad", () => ({})));
      __publicField(this, "floorCard", new class {
        constructor(parent) {
          this.parent = parent;
          __publicField(this, "shouldExclude", (i) => {
            if (this.excludeAll) {
              return true;
            }
            if (this.excludeByChannel.includes(i.channel)) {
              return true;
            }
            return false;
          });
        }
        get value() {
          return this.parent.value.get().floorCard;
        }
        set value(v) {
          this.parent.value.set(__spreadProps(__spreadValues({}, this.parent.value.get()), {
            floorCard: v
          }));
        }
        get excludeAll() {
          var _a2;
          return (_a2 = this.value) == null ? void 0 : _a2.excludeAll;
        }
        set excludeAll(v) {
          this.value = __spreadProps(__spreadValues({}, this.value), {
            excludeAll: v
          });
        }
        get excludeByChannel() {
          var _a2, _b2;
          return (_b2 = (_a2 = this.value) == null ? void 0 : _a2.excludeByChannel) != null ? _b2 : [];
        }
        set excludeByChannel(v) {
          this.value = __spreadProps(__spreadValues({}, this.value), {
            excludeByChannel: Array.from(new Set(v)).sort()
          });
        }
      }(this));
    }
    get allowAdblockTips() {
      var _a2;
      return (_a2 = this.value.get().allowAdblockTips) != null ? _a2 : false;
    }
    set allowAdblockTips(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        allowAdblockTips: v || void 0
      }));
    }
  }();

  // src/utils/roundDecimal.ts
  function roundDecimal(v, decimalPlaces) {
    const factor = __pow(10, decimalPlaces);
    return Math.round(v * factor + Number.EPSILON) / factor;
  }

  // src/utils/Duration.ts
  function leadingInt(s) {
    let i = 0;
    let x = 0;
    for (; i < s.length; i += 1) {
      const c = s[i];
      if (c < "0" || c > "9") {
        break;
      }
      if (x > Number.MAX_SAFE_INTEGER / 10) {
        throw new Error("overflow");
      }
      x = x * 10 + Number.parseInt(c, 10);
      if (x < 0) {
        throw new Error("overflow");
      }
    }
    return [x, s.slice(i)];
  }
  function leadingNegative(s) {
    if (s === "") {
      return [false, s];
    }
    const c = s[0];
    if (c === "-" || c === "+") {
      return [c === "-", s.slice(1)];
    }
    return [false, s];
  }
  function leadingFraction(s) {
    let x = 0;
    let i = 0;
    let scale = 1;
    let overflow = false;
    for (; i < s.length; i += 1) {
      const c = s[i];
      if (c < "0" || c > "9") {
        break;
      }
      if (overflow) {
        continue;
      }
      if (x > Number.MAX_SAFE_INTEGER / 10) {
        overflow = true;
        continue;
      }
      const y = x * 10 + Number.parseInt(c, 10);
      if (y < 0) {
        overflow = true;
        continue;
      }
      x = y;
      scale *= 10;
    }
    return [x, scale, s.slice(i)];
  }
  function padLeft(v, c, n) {
    let ret = v;
    while (ret.length < n) {
      ret = c + ret;
    }
    return ret;
  }
  function formatSeconds(v) {
    let ret = v.toFixed(3);
    if (ret.indexOf(".") < 2) {
      ret = `0${ret}`;
    }
    return ret;
  }
  var _Duration = class _Duration {
    constructor({
      invalid = false,
      negative = false,
      years = 0,
      months = 0,
      weeks = 0,
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0
    } = {}) {
      __publicField(this, "invalid", false);
      __publicField(this, "negative", false);
      __publicField(this, "years", 0);
      __publicField(this, "months", 0);
      __publicField(this, "weeks", 0);
      __publicField(this, "days", 0);
      __publicField(this, "hours", 0);
      __publicField(this, "minutes", 0);
      __publicField(this, "seconds", 0);
      __publicField(this, "milliseconds", 0);
      __publicField(this, "toISOString", () => {
        if (this.invalid) {
          return "";
        }
        let b = "";
        if (this.negative) {
          b += "-";
        }
        b += "P";
        const prefixWidth = b.length;
        if (this.years) {
          b = this.years.toString();
          b += "Y";
        }
        if (this.months) {
          b = this.months.toString();
          b += "M";
        }
        if (this.weeks) {
          b = this.weeks.toString();
          b += "W";
        }
        if (this.days) {
          b += this.days.toString();
          b += "D";
        }
        if (this.hours || this.minutes || this.seconds || this.milliseconds) {
          b += "T";
        }
        if (this.hours) {
          b += this.hours.toString();
          b += "H";
        }
        if (this.minutes) {
          b += this.minutes.toString();
          b += "M";
        }
        if (this.seconds || this.milliseconds) {
          b += roundDecimal(
            this.seconds + this.milliseconds / _Duration.SECOND,
            3
          ).toString();
          b += "S";
        }
        if (b.length === prefixWidth) {
          b += "0D";
        }
        return b;
      });
      __publicField(this, "toMilliseconds", () => {
        if (this.invalid) {
          return NaN;
        }
        return (this.negative ? -1 : 1) * (this.years * _Duration.YEAR + this.months * _Duration.MONTH + this.weeks * _Duration.WEEK + this.days * _Duration.DAY + this.hours * _Duration.HOUR + this.minutes * _Duration.MINUTE + this.seconds * _Duration.SECOND + this.milliseconds * _Duration.MILLISECOND);
      });
      __publicField(this, "toHours", () => {
        return this.toMilliseconds() / _Duration.HOUR;
      });
      __publicField(this, "toString", () => {
        if (this.invalid) {
          return "Invalid Duration";
        }
        return this.toISOString();
      });
      /**
       * Format duration to `HH:MM:SS.sss` format
       */
      __publicField(this, "toTimeCode", (fixed = false) => {
        if (this.invalid) {
          return "";
        }
        let v = this.toMilliseconds();
        let sign = "";
        if (v < 0) {
          sign = "-";
          v = -v;
        }
        v /= 1e3;
        const seconds = v % 60;
        v = Math.trunc(v / 60);
        const minutes = v % 60;
        v = Math.trunc(v / 60);
        const hours = v;
        let ret = `${padLeft(hours.toFixed(0), "0", 2)}:${padLeft(
          minutes.toFixed(0),
          "0",
          2
        )}:${formatSeconds(seconds)}`;
        if (!fixed) {
          if (ret.startsWith("0") && ret[1] !== ":") {
            ret = ret.slice(1);
          }
          ret = ret.replace(/\.?0+$/, "");
        }
        ret = sign + ret;
        return ret;
      });
      __publicField(this, "add", (other) => {
        return _Duration.fromMilliseconds(
          this.toMilliseconds() + _Duration.cast(other).toMilliseconds()
        );
      });
      __publicField(this, "sub", (other) => {
        return _Duration.fromMilliseconds(
          this.toMilliseconds() - _Duration.cast(other).toMilliseconds()
        );
      });
      __publicField(this, "abs", () => {
        return _Duration.fromMilliseconds(Math.abs(this.toMilliseconds()));
      });
      __publicField(this, "isZero", () => {
        return this.toMilliseconds() === 0;
      });
      __publicField(this, "truncate", (unitMs) => {
        if (unitMs <= 0) {
          return this;
        }
        const ms = this.toMilliseconds();
        return _Duration.fromMilliseconds(ms - ms % unitMs);
      });
      let invalidCount = 0;
      if (invalid) {
        invalidCount += 1;
      }
      function checkNumber(v) {
        if (Number.isFinite(v)) {
          return v;
        }
        invalidCount += 1;
        return 0;
      }
      this.negative = negative;
      this.years = checkNumber(years);
      this.months = checkNumber(months);
      this.weeks = checkNumber(weeks);
      this.days = checkNumber(days);
      this.hours = checkNumber(hours);
      this.minutes = checkNumber(minutes);
      this.seconds = checkNumber(seconds);
      this.milliseconds = checkNumber(milliseconds);
      this.invalid = invalidCount > 0;
    }
    get valid() {
      return !this.invalid;
    }
  };
  __publicField(_Duration, "MILLISECOND", 1);
  __publicField(_Duration, "SECOND", 1e3);
  __publicField(_Duration, "MINUTE", _Duration.SECOND * 60);
  __publicField(_Duration, "HOUR", _Duration.MINUTE * 60);
  __publicField(_Duration, "DAY", _Duration.HOUR * 24);
  __publicField(_Duration, "WEEK", _Duration.DAY * 7);
  __publicField(_Duration, "MONTH", _Duration.DAY / 10 * 146097 / 4800 * 10);
  __publicField(_Duration, "YEAR", _Duration.MONTH * 12);
  __publicField(_Duration, "fromMilliseconds", (milliseconds = 0) => {
    const d2 = {};
    let ms = milliseconds;
    if (ms < 0) {
      d2.negative = true;
      ms = -ms;
    }
    d2.hours = Math.trunc(ms / _Duration.HOUR);
    ms %= _Duration.HOUR;
    d2.minutes = Math.trunc(ms / _Duration.MINUTE);
    ms %= _Duration.MINUTE;
    d2.seconds = Math.trunc(ms / _Duration.SECOND);
    ms %= _Duration.SECOND;
    d2.milliseconds = ms;
    return new _Duration(d2);
  });
  __publicField(_Duration, "fromTimeCode", (value) => {
    if (value === "") {
      return new _Duration({ invalid: true });
    }
    let s = value;
    const d2 = {
      negative: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    if (s.startsWith("-")) {
      s = s.slice(1);
      d2.negative = true;
    }
    const parts = s.split(/[:：]/);
    parts.splice(0, 0, ...["0", "0"].splice(parts.length - 1));
    const [hours, minutes, seconds] = parts;
    if (hours) {
      d2.hours = parseFloat(hours);
    }
    if (minutes) {
      d2.minutes = parseFloat(minutes);
    }
    if (seconds) {
      d2.seconds = parseFloat(seconds);
    }
    return new _Duration(d2);
  });
  /**
   * @param value iso 8601 duration string
   */
  __publicField(_Duration, "parse", (value) => {
    const d2 = {
      invalid: false,
      negative: false,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    };
    let s = value;
    [d2.negative, s] = leadingNegative(s);
    if (s === "" || !s.startsWith("P")) {
      d2.invalid = true;
      return new _Duration(d2);
    }
    s = s.slice(1);
    let afterT = false;
    while (s) {
      if (s.startsWith("T")) {
        s = s.slice(1);
        afterT = true;
      }
      let v = 0;
      let f = 0;
      let scale = 1;
      let neg = false;
      let pre = false;
      let post = false;
      [neg, s] = leadingNegative(s);
      const pl = s.length;
      [v, s] = leadingInt(s);
      pre = pl !== s.length;
      if (neg) {
        v = -v;
      }
      if (s.startsWith(".")) {
        s = s.slice(1);
        const pl2 = s.length;
        [f, scale, s] = leadingFraction(s);
        post = pl2 !== s.length;
        if (neg) {
          f = -f;
        }
      }
      if (!pre && !post) {
        d2.invalid = true;
        return new _Duration(d2);
      }
      const u = s[0];
      s = s.slice(1);
      if (!afterT) {
        switch (u) {
          case "Y":
            d2.years += v;
            d2.months += f * (_Duration.YEAR / _Duration.MONTH / scale);
            break;
          case "M":
            d2.months += v;
            d2.weeks += f * (_Duration.MONTH / _Duration.WEEK / scale);
            break;
          case "W":
            d2.weeks += v;
            d2.days += f * (_Duration.WEEK / _Duration.DAY / scale);
            break;
          case "D":
            d2.days += v;
            d2.hours += f * (_Duration.DAY / _Duration.HOUR / scale);
            break;
          default:
            d2.invalid = false;
            return new _Duration(d2);
        }
      } else {
        switch (u) {
          case "H":
            d2.hours += v;
            d2.minutes += f * (_Duration.HOUR / _Duration.MINUTE / scale);
            break;
          case "M":
            d2.minutes += v;
            d2.seconds += f * (_Duration.MINUTE / _Duration.SECOND / scale);
            break;
          case "S":
            d2.seconds += v;
            d2.milliseconds += f * (_Duration.SECOND / _Duration.MILLISECOND / scale);
            break;
          default:
            d2.invalid = true;
            return new _Duration(d2);
        }
      }
      if (post && s !== "") {
        d2.invalid = true;
        return new _Duration(d2);
      }
    }
    return new _Duration(d2);
  });
  __publicField(_Duration, "cast", (v) => {
    if (v instanceof _Duration) {
      return v;
    }
    if (typeof v === "string") {
      if (v.startsWith("P") || v.startsWith("-P")) {
        return _Duration.parse(v);
      }
      return _Duration.fromTimeCode(v);
    }
    return new _Duration(v);
  });
  var Duration = _Duration;

  // src/utils/optionalArray.ts
  function optionalArray(arr) {
    if (!arr || arr.length === 0) {
      return;
    }
    return arr;
  }

  // src/bilibili.com/models/videoListSettings.ts
  var videoListSettings_default = new class VideoListSettings {
    constructor() {
      __publicField(this, "value", new GMValue("videoListSettings@4eb93ea9-8748-4647-876f-30451395e561", () => ({})));
    }
    get allowAdvertisement() {
      var _a2;
      return (_a2 = this.value.get().allowAdvertisement) != null ? _a2 : false;
    }
    set allowAdvertisement(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        allowAdvertisement: v || void 0
      }));
    }
    get allowPromoted() {
      var _a2;
      return (_a2 = this.value.get().allowPromoted) != null ? _a2 : false;
    }
    set allowPromoted(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        allowPromoted: v || void 0
      }));
    }
    get excludeKeywords() {
      var _a2;
      return (_a2 = this.value.get().excludeKeywords) != null ? _a2 : [];
    }
    set excludeKeywords(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        excludeKeywords: optionalArray(v.filter((i) => i))
      }));
    }
    get durationGte() {
      var _a2;
      return Duration.parse((_a2 = this.value.get().durationGte) != null ? _a2 : "");
    }
    set durationGte(v) {
      const d2 = Duration.cast(v);
      if (d2.toMilliseconds() >= Duration.HOUR) {
        this.durationGte = "PT1M";
        return;
      }
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        durationGte: d2.invalid ? void 0 : d2.toISOString()
      }));
    }
    get durationLt() {
      var _a2;
      const v = Duration.parse((_a2 = this.value.get().durationLt) != null ? _a2 : "");
      if (v.toMilliseconds() <= 10 * Duration.MINUTE) {
        return Duration.parse("");
      }
      return v;
    }
    set durationLt(v) {
      const d2 = Duration.cast(v);
      if (d2.valid && d2.toMilliseconds() <= 10 * Duration.MINUTE) {
        this.durationLt = "PT30M";
        return;
      }
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        durationLt: d2.invalid ? void 0 : d2.toISOString()
      }));
    }
  }();

  // src/bilibili.com/models/searchSettings.ts
  var searchSettings_default = new class SearchSettings {
    constructor() {
      __publicField(this, "value", new GMValue("searchSettings@aa1595c8-1664-40de-a80c-9de375c2466a", () => ({})));
    }
    get strictTitleMatch() {
      var _a2;
      return (_a2 = this.value.get().strictTitleMatch) != null ? _a2 : false;
    }
    set strictTitleMatch(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        strictTitleMatch: v || void 0
      }));
    }
    get navSuggestion() {
      var _a2;
      return (_a2 = this.value.get().navSuggestion) != null ? _a2 : "on";
    }
    set navSuggestion(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        navSuggestion: v === "on" ? void 0 : v
      }));
    }
    get trending() {
      var _a2;
      return (_a2 = this.value.get().trending) != null ? _a2 : "on";
    }
    set trending(v) {
      this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
        trending: v === "on" ? void 0 : v
      }));
    }
  }();

  // src/bilibili.com/models/blockedLiveRooms.ts
  var blockedLiveRooms_default = new class {
    constructor() {
      __publicField(this, "value", new GMValue(
        "blockedLiveRooms@031f022e-51b9-4361-8cfb-80263a0d7595",
        () => ({})
      ));
      __publicField(this, "has", (id) => {
        return !!this.value.get()[id];
      });
      __publicField(this, "get", (id) => {
        const value = this.value.get()[id];
        return {
          id,
          blockedAt: new Date(value.blockedAt),
          owner: value.owner
        };
      });
      __publicField(this, "distinctID", () => {
        return Object.keys(this.value.get());
      });
      __publicField(this, "add", ({ id, owner }) => {
        if (this.has(id)) {
          return;
        }
        this.value.set(__spreadProps(__spreadValues({}, this.value.get()), {
          [id]: {
            owner: owner.trim(),
            blockedAt: Date.now()
          }
        }));
      });
      __publicField(this, "remove", (id) => {
        if (!this.has(id)) {
          return;
        }
        this.value.set(
          Object.fromEntries(
            Object.entries(this.value.get()).filter(([k]) => k !== id)
          )
        );
      });
      __publicField(this, "toggle", (room, force) => {
        const want = force != null ? force : !this.has(room.id);
        if (want) {
          this.add(room);
        } else {
          this.remove(room.id);
        }
      });
    }
  }();

  // src/utils/obtainHTMLElementByDataKey.ts
  function obtainHTMLElementByDataKey({
    tag: tag2,
    key: key2,
    parentNode = document,
    onDidCreate
  }) {
    const match = parentNode.querySelector(
      `[data-${key2}]`
    );
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.setAttribute(`data-${key2}`, "");
    onDidCreate == null ? void 0 : onDidCreate(el);
    return el;
  }

  // src/bilibili.com/style.css
  var style_default = "/* \n用户脚本样式\nhttps://github.com/NateScarlet/user-scripts/blob/master/src/bilibili.com/\n*/\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n/* \n! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com\n*/\n\n/*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n5. Use the user's configured `sans` font-feature-settings by default.\n6. Use the user's configured `sans` font-variation-settings by default.\n7. Disable tap highlights on iOS\n*/\n\nhtml,\n:host {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n  font-feature-settings: normal; /* 5 */\n  font-variation-settings: normal; /* 6 */\n  -webkit-tap-highlight-color: transparent; /* 7 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font-family by default.\n2. Use the user's configured `mono` font-feature-settings by default.\n3. Use the user's configured `mono` font-variation-settings by default.\n4. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */\n  font-feature-settings: normal; /* 2 */\n  font-variation-settings: normal; /* 3 */\n  font-size: 1em; /* 4 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-feature-settings: inherit; /* 1 */\n  font-variation-settings: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  letter-spacing: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\ninput:where([type='button']),\ninput:where([type='reset']),\ninput:where([type='submit']) {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nReset default styling for dialogs.\n*/\n\ndialog {\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n\n[hidden]:where(:not([hidden=\"until-found\"])) {\n  display: none;\n}\n\n* {\n  font-size: 16px;\n  line-height: 24px;\n}\n\n.static {\n  position: static;\n}\n\n.fixed {\n  position: fixed;\n}\n\n.absolute {\n  position: absolute;\n}\n\n.relative {\n  position: relative;\n}\n\n.sticky {\n  position: sticky;\n}\n\n.inset-0 {\n  inset: 0px;\n}\n\n.inset-y-0 {\n  top: 0px;\n  bottom: 0px;\n}\n\n.left-2 {\n  left: 0.5rem;\n}\n\n.right-0 {\n  right: 0px;\n}\n\n.top-0 {\n  top: 0px;\n}\n\n.top-2 {\n  top: 0.5rem;\n}\n\n.isolate {\n  isolation: isolate;\n}\n\n.z-20 {\n  z-index: 20;\n}\n\n.m-1 {\n  margin: 0.25rem;\n}\n\n.my-1 {\n  margin-top: 0.25rem;\n  margin-bottom: 0.25rem;\n}\n\n.mb-1 {\n  margin-bottom: 0.25rem;\n}\n\n.block {\n  display: block;\n}\n\n.inline {\n  display: inline;\n}\n\n.flex {\n  display: flex;\n}\n\n.inline-flex {\n  display: inline-flex;\n}\n\n.table {\n  display: table;\n}\n\n.\\!hidden {\n  display: none !important;\n}\n\n.hidden {\n  display: none;\n}\n\n.h-6 {\n  height: 1.5rem;\n}\n\n.h-7 {\n  height: 1.75rem;\n}\n\n.h-8 {\n  height: 2rem;\n}\n\n.h-\\[1\\.25em\\] {\n  height: 1.25em;\n}\n\n.max-h-\\[50vh\\] {\n  max-height: 50vh;\n}\n\n.w-32 {\n  width: 8rem;\n}\n\n.w-48 {\n  width: 12rem;\n}\n\n.w-6 {\n  width: 1.5rem;\n}\n\n.w-64 {\n  width: 16rem;\n}\n\n.w-full {\n  width: 100%;\n}\n\n.w-screen {\n  width: 100vw;\n}\n\n.max-w-4xl {\n  max-width: 56rem;\n}\n\n.max-w-lg {\n  max-width: 32rem;\n}\n\n.flex-1 {\n  flex: 1 1 0%;\n}\n\n.flex-auto {\n  flex: 1 1 auto;\n}\n\n.flex-none {\n  flex: none;\n}\n\n.table-fixed {\n  table-layout: fixed;\n}\n\n.border-separate {\n  border-collapse: separate;\n}\n\n.border-spacing-2 {\n  --tw-border-spacing-x: 0.5rem;\n  --tw-border-spacing-y: 0.5rem;\n  border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);\n}\n\n.translate-x-full {\n  --tw-translate-x: 100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.translate-y-10 {\n  --tw-translate-y: 2.5rem;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.cursor-pointer {\n  cursor: pointer;\n}\n\n.cursor-text {\n  cursor: text;\n}\n\n.cursor-zoom-out {\n  cursor: zoom-out;\n}\n\n.flex-col {\n  flex-direction: column;\n}\n\n.flex-wrap {\n  flex-wrap: wrap;\n}\n\n.items-center {\n  align-items: center;\n}\n\n.justify-end {\n  justify-content: flex-end;\n}\n\n.justify-center {\n  justify-content: center;\n}\n\n.justify-between {\n  justify-content: space-between;\n}\n\n.gap-2 {\n  gap: 0.5rem;\n}\n\n.space-x-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(0.5rem * var(--tw-space-x-reverse));\n  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));\n}\n\n.space-y-1 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));\n}\n\n.self-end {\n  align-self: flex-end;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.whitespace-nowrap {\n  white-space: nowrap;\n}\n\n.rounded {\n  border-radius: 0.25rem;\n}\n\n.rounded-full {\n  border-radius: 9999px;\n}\n\n.rounded-lg {\n  border-radius: 0.5rem;\n}\n\n.rounded-md {\n  border-radius: 0.375rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.border-b {\n  border-bottom-width: 1px;\n}\n\n.border-t {\n  border-top-width: 1px;\n}\n\n.border-none {\n  border-style: none;\n}\n\n.border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity, 1));\n}\n\n.bg-\\[rgba\\(33\\2c 33\\2c 33\\2c \\.8\\)\\] {\n  background-color: rgba(33,33,33,.8);\n}\n\n.bg-black {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n}\n\n.bg-blue-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(37 99 235 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(209 213 219 / var(--tw-bg-opacity, 1));\n}\n\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));\n}\n\n.bg-opacity-25 {\n  --tw-bg-opacity: 0.25;\n}\n\n.bg-opacity-30 {\n  --tw-bg-opacity: 0.3;\n}\n\n.fill-current {\n  fill: currentColor;\n}\n\n.p-1 {\n  padding: 0.25rem;\n}\n\n.p-2 {\n  padding: 0.5rem;\n}\n\n.p-4 {\n  padding: 1rem;\n}\n\n.px-1 {\n  padding-left: 0.25rem;\n  padding-right: 0.25rem;\n}\n\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n\n.px-4 {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n\n.py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n\n.py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n\n.py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.text-right {\n  text-align: right;\n}\n\n.align-top {\n  vertical-align: top;\n}\n\n.font-serif {\n  font-family: ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif;\n}\n\n.text-lg {\n  font-size: 20px;\n  line-height: 28px;\n}\n\n.text-sm {\n  font-size: 14px;\n  line-height: 20px;\n}\n\n.text-xs {\n  font-size: 12px;\n  line-height: 14px;\n}\n\n.font-medium {\n  font-weight: 500;\n}\n\n.text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity, 1));\n}\n\n.text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(59 130 246 / var(--tw-text-opacity, 1));\n}\n\n.text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity, 1));\n}\n\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n\n.underline {\n  text-decoration-line: underline;\n}\n\n.opacity-0 {\n  opacity: 0;\n}\n\n.opacity-100 {\n  opacity: 1;\n}\n\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-xl {\n  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n\n.backdrop-blur {\n  --tw-backdrop-blur: blur(8px);\n  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n}\n\n.backdrop-blur-sm {\n  --tw-backdrop-blur: blur(4px);\n  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n}\n\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-transform {\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.duration-200 {\n  transition-duration: 200ms;\n}\n\n.duration-300 {\n  transition-duration: 300ms;\n}\n\n.ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.even\\:bg-gray-100:nth-child(even) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-blue-700:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(29 78 216 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-gray-200:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n\n.focus\\:border-blue-500:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(59 130 246 / var(--tw-border-opacity, 1));\n}\n\n.focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\n.focus\\:ring-2:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity, 1));\n}\n\n.group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n\n@media (min-width: 1024px) {\n\n  .lg\\:hidden {\n    display: none;\n  }\n}\n";

  // src/bilibili.com/utils/obtainStyledShadowRoot.ts
  var key = "36fff111-0148-4cc1-869b-06dfdfc36861";
  var map = /* @__PURE__ */ new WeakMap();
  function obtainStyledShadowRoot(el) {
    var _a2, _b2;
    const root2 = (_b2 = (_a2 = map.get(el)) != null ? _a2 : el.shadowRoot) != null ? _b2 : el.attachShadow({ mode: "closed" });
    map.set(el, root2);
    obtainHTMLElementByDataKey({
      tag: "style",
      key,
      parentNode: root2,
      onDidCreate: (el2) => {
        el2.innerHTML = style_default;
        root2.prepend(el2);
      }
    });
    return root2;
  }

  // src/bilibili.com/components/PromptDialog.ts
  var PromptDialog = class {
    constructor(options, onDidClose) {
      this.options = options;
      this.onDidClose = onDidClose;
      __publicField(this, "isOpen", false);
      __publicField(this, "active", false);
      __publicField(this, "container");
      __publicField(this, "shadowRoot");
      __publicField(this, "id", `prompt-${randomUUID()}`);
      __publicField(this, "value");
      this.value = options.value || "";
    }
    dispose() {
      var _a2;
      (_a2 = this.container) == null ? void 0 : _a2.remove();
    }
    open() {
      if (this.isOpen) {
        return;
      }
      this.container = obtainHTMLElementByID({
        tag: "div",
        id: this.id,
        onDidCreate: (el) => {
          el.role = "dialog";
          el.style.position = "fixed";
          el.style.zIndex = "10000";
          document.body.appendChild(el);
        }
      });
      this.shadowRoot = obtainStyledShadowRoot(this.container);
      this.active = true;
      this.render();
      setTimeout(() => {
        this.isOpen = true;
        this.render();
        if (this.shadowRoot) {
          const input = this.shadowRoot.getElementById("dialog-input");
          if (input instanceof HTMLInputElement) {
            input.select();
            input.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      }, 20);
    }
    close(result) {
      if (!this.isOpen) {
        return;
      }
      this.isOpen = false;
      this.render();
      setTimeout(() => {
        if (!this.isOpen) {
          this.dispose();
        }
      }, 1e3);
      this.onDidClose(result);
    }
    render() {
      if (this.shadowRoot) {
        render(this.active ? this.dialog() : nothing, this.shadowRoot);
      }
    }
    dialog() {
      const {
        title = "编辑",
        label = "",
        placeholder = "",
        actionText = "保存"
      } = this.options;
      return html`
      <div
        class="
          fixed inset-0 
          bg-black bg-opacity-30 backdrop-blur-sm
          flex items-center justify-center p-4
          transition-opacity duration-300 ease-in-out
          ${this.isOpen ? "opacity-100" : "opacity-0"}
        "
        @click=${(e) => {
        if (e.target === e.currentTarget)
          this.close(null);
      }}
        @transitionend=${(e) => {
        if (e.propertyName === "opacity" && !this.isOpen) {
          if (!this.isOpen) {
            this.active = false;
            this.render();
          }
        }
      }}
      >
      <div 
        class="
          bg-white rounded-lg shadow-xl w-full max-w-lg
          transform transition-transform duration-300 ease-in-out
          ${this.isOpen ? "" : "translate-y-10"}
        "
        @click=${(e) => e.stopPropagation()}
        @transitionend=${(e) => {
        if (e.propertyName === "transform" && !this.isOpen) {
          this.close(null);
        }
      }}
      >
        <form
          @submit=${(e) => {
        e.preventDefault();
        return this.close(this.value);
      }}
        >
          <div class="border-b px-4 py-3 flex justify-between items-center">
            <h3 class="text-lg font-medium">${title}</h3>
            <button 
              type="button"
              class="p-1 rounded-full hover:bg-gray-100 transition-colors"
              @click=${() => this.close(null)}
            >
              <svg 
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
              >
                <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
              </svg>
            </button>
          </div>
          <div class="p-4">
            ${label ? html`<label
                    for="dialog-input"
                    class="block text-sm font-medium mb-1"
                  >
                    ${label}
                  </label>` : nothing}
            <input
              id="dialog-input"
              class="
                w-full p-2 border border-gray-300 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                focus:outline-none shadow-sm
              "
              type="text"
              .value="${this.value}"
              placeholder="${placeholder}"
              @input="${(e) => {
        this.value = e.target.value;
      }}"
              autofocus
            />
          </div>
          <div class="border-t px-4 py-3 flex justify-end gap-2">
            <button
              type="button"
              class="
                px-4 py-2 rounded-md text-sm font-medium
                bg-gray-100 hover:bg-gray-200 transition-colors
              "
              @click=${() => this.close(null)}
            >
              取消
            </button>
            <button
              type="submit"
              class="
                px-4 py-2 rounded-md text-sm font-medium text-white
                bg-blue-600 hover:bg-blue-700 transition-colors
              "
            >
              ${actionText}
            </button>
          </div>
        </form>
      </div>
    `;
    }
  };

  // src/bilibili.com/utils/showPromptDialog.ts
  function showPromptDialog() {
    return __async(this, arguments, function* (options = {}) {
      return yield new Promise((resolve) => {
        const dialog = new PromptDialog(options, resolve);
        dialog.open();
      });
    });
  }

  // src/bilibili.com/components/SettingsDrawer.ts
  var _SettingsDrawer = class _SettingsDrawer {
    constructor() {
      __publicField(this, "isOpen", false);
      __publicField(this, "active", false);
      __publicField(this, "open", () => {
        this.active = true;
        this.render();
        setTimeout(() => {
          this.isOpen = true;
          this.render();
        }, 20);
      });
      __publicField(this, "close", () => {
        this.isOpen = false;
        this.render();
      });
      __publicField(this, "excludedKeywordsBuffer");
      __publicField(this, "onExcludeKeywordInput", (e) => {
        const el = e.target;
        this.excludedKeywords = el.value;
        growTextAreaHeight(el);
      });
      __publicField(this, "onVideListDurationGteChange", debounce_default((e) => {
        const el = e.target;
        videoListSettings_default.durationGte = el.value;
        el.value = videoListSettings_default.durationGte.toTimeCode();
      }, 5e3));
      __publicField(this, "onVideListDurationLtChange", debounce_default((e) => {
        const el = e.target;
        videoListSettings_default.durationLt = el.value;
        el.value = videoListSettings_default.durationLt.toTimeCode();
      }, 5e3));
      __publicField(this, "render", () => {
        render(
          this.html(),
          obtainStyledShadowRoot(
            obtainHTMLElementByID({
              tag: "div",
              id: _SettingsDrawer.id,
              onDidCreate: (el) => {
                el.style.position = "fixed";
                el.style.zIndex = "9999";
                document.body.append(el);
              }
            })
          )
        );
      });
    }
    html() {
      if (!this.active) {
        return nothing;
      }
      return html`
    <div 
      class="
        fixed inset-0 
        bg-white bg-opacity-25 backdrop-blur
        cursor-zoom-out transition duration-200 ease-in-out
        ${this.isOpen ? "opacity-100" : "opacity-0"}
      "
      @click=${() => this.close()}
    >
    </div>
    <div
      class="
        fixed inset-y-0 right-0 w-screen max-w-4xl
        bg-white overflow-auto p-2 space-y-1
        transition-transform
        ${this.isOpen ? "" : "translate-x-full"}
      "
      @transitionend=${() => {
        if (!this.isOpen) {
          this.active = false;
          this.render();
        }
      }}
    >
      <button 
        type="button" 
        class="lg:hidden self-end flex items-center"
        @click=${() => this.close()}
      >
        <svg 
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="h-[1.25em] align-top"
        >
          <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
        </svg>
        <span>关闭</span>
      </button>
     ${this.homePageSettings()}
     ${this.searchSettings()}
     ${this.videoListSettings()}
     ${this.userTable()}
     ${this.liveRoomTable()}
    </div>`;
    }
    homePageSettings() {
      return html`
      <section>
        <h1 class="text-sm text-gray-500">主页</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              .checked="${homePageSettings_default.allowAdblockTips}"
              @change="${(e) => {
        const el = e.target;
        homePageSettings_default.allowAdblockTips = el.checked;
      }}"
            />
            <span>允许</span>
            <span class="text-sm rounded" 
              style="
                color: #e58900;
                background-color: #fff0e3;
              "
            >检测到您的页面...</span>
            <span>提示</span>
          </label>
          <section>
            <h2 class="text-gray-500 text-sm">楼层推广卡片</h2>
            <div class="px-1">
              <div>
                <label>
                  <input
                    type="checkbox"
                    ?checked="${homePageSettings_default.floorCard.excludeAll}"
                    @change="${(e) => {
        const el = e.target;
        homePageSettings_default.floorCard.excludeAll = el.checked;
      }}"
                  />
                  <span>屏蔽所有</span>
                </label>
              </div>
              ${(() => {
        if (homePageSettings_default.floorCard.excludeAll) {
          return nothing;
        }
        if (homePageSettings_default.floorCard.excludeByChannel.length === 0) {
          return html`<div class="text-gray-500 text-sm">
                    可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广
                  </div>`;
        }
        return html`
                <div>
                  <h2 class="flex-none text-sm text-gray-500">
                    已屏蔽频道 <span class="text-sm">(${homePageSettings_default.floorCard.excludeByChannel.length})</span>
                  </h1>
                  <ol class="flex flex-wrap gap-2 items-center">
                    ${homePageSettings_default.floorCard.excludeByChannel.map(
          (channel) => {
            return html`
                      <li class="bg-gray-300 rounded px-1 flex items-center">
                        <span>${channel}</span>
                        <button
                          type="button"
                          @click=${() => {
              homePageSettings_default.floorCard.excludeByChannel = homePageSettings_default.floorCard.excludeByChannel.filter(
                (i) => i !== channel
              );
            }}
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
                          </svg>
                        </button>
                      </li>`;
          }
        )}
                  </ol>
                </div>
              `;
      })()}
            </section>
          </div>
        </div>
      </section>
    `;
    }
    get excludedKeywords() {
      var _a2;
      return (_a2 = this.excludedKeywordsBuffer) != null ? _a2 : videoListSettings_default.excludeKeywords.join("\n");
    }
    set excludedKeywords(v) {
      this.excludedKeywordsBuffer = v;
      videoListSettings_default.excludeKeywords = v.split("\n");
    }
    videoListSettings() {
      return html`
      <section>
        <h1 class="text-sm text-gray-500">视频列表</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              ?checked="${videoListSettings_default.allowAdvertisement}"
              @change="${(e) => {
        const el = e.target;
        videoListSettings_default.allowAdvertisement = el.checked;
      }}"
            />
            <span>允许广告（非视频）</span>
          </label>
          <label>
            <input
              type="checkbox"
              ?checked="${videoListSettings_default.allowPromoted}"
              @change="${(e) => {
        const el = e.target;
        videoListSettings_default.allowPromoted = el.checked;
      }}"
            />
            <span>允许推广</span>
          </label>
          <label class="flex items-center">
            <span class="flex-none w-32">最短（含）</span>
            <input
              class="flex-auto border my-1 p-1"
              type="text"
              placeholder="HH:MM:SS"
              value="${videoListSettings_default.durationGte.toTimeCode()}"
              @input="${this.onVideListDurationGteChange}"
              @keydown="${(e) => e.stopPropagation()}"
              @blur="${() => {
        this.onVideListDurationGteChange.flush();
      }}"
              @keyup="${(e) => {
        if (e.key === "Enter") {
          this.onVideListDurationGteChange(e);
          this.onVideListDurationGteChange.flush();
        }
      }}"
            />
          </label>
          <label class="flex items-center">
            <span class="flex-none w-32">最长（不含）</span>
            <input
              class="flex-auto border my-1 p-1"
              type="text"
              placeholder="HH:MM:SS"
              value="${videoListSettings_default.durationLt.toTimeCode()}"
              @input="${this.onVideListDurationLtChange}"
              @keydown="${(e) => e.stopPropagation()}"
              @blur="${() => {
        this.onVideListDurationLtChange.flush();
      }}"
              @keyup="${(e) => {
        if (e.key === "Enter") {
          this.onVideListDurationLtChange(e);
          this.onVideListDurationLtChange.flush();
        }
      }}"
            />
          </label>
          <label class="flex items-center">
            <div class="flex-none w-32">排除关键词</div>
            <div class="flex-auto">
              <textarea
                class="w-full border my-1 p-1"
                placeholder=""
                .value="${this.excludedKeywords}"
                @input="${this.onExcludeKeywordInput}"
                @keydown="${(e) => e.stopPropagation()}"
                @focus="${(e) => growTextAreaHeight(e.target)}"
                @blur=${() => {
        this.excludedKeywordsBuffer = void 0;
      }}
              ></textarea>
              <div class="text-gray-500 text-sm">
                不显示标题含关键词的视频。每行一个，不区分大小写。
              </div>
            </div>
          </label>
        </div>
      </section>
    `;
    }
    searchSettings() {
      return html`
      <section>
        <h1 class="text-sm text-gray-500">搜索</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              ?checked="${searchSettings_default.strictTitleMatch}"
              @change="${(e) => {
        const el = e.target;
        searchSettings_default.strictTitleMatch = el.checked;
      }}"
            />
            <span>严格标题匹配</span>
          </label>
          <div class="text-gray-500 text-sm">
            标题必须包含所有关键词，屏蔽联想词和标签匹配
          </div>
        </div>
      </section>
    `;
    }
    userTable() {
      const userIDs = blockedUsers_default.distinctID();
      return html`
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽用户 <span class="text-sm">(${userIDs.length})</span>
        </h1>
        <div class="flex-1 overflow-auto relative">
          <table class="table-fixed border-separate border-spacing-2 w-full">
            <thead class="sticky top-0">
              <tr class="bg-gray-200 text-center">
                <td class="w-48">屏蔽时间</td>
                <td>名称</td>
                <td class="w-64"></td>
              </tr>
            </thead>
            <tbody>
              ${userIDs.map(blockedUsers_default.get).filter(isNonNull).sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.idAsNumber, b.idAsNumber);
      }).map(({ id, name, note, blockedAt, rawBlockedAt }) => {
        return html`
                    <tr class="group even:bg-gray-100">
                      <td class="text-right w-32">
                        ${rawBlockedAt ? html` <time datetime="${blockedAt.toISOString()}">
                                ${blockedAt.toLocaleString()}
                              </time>` : nothing}
                      </td>
                      <td class="text-center hover:underline cursor-text" @click=${() => __async(this, null, function* () {
          const v = yield showPromptDialog({
            title: `编辑备注`,
            label: `为 ${name} 添加备注:`,
            value: note,
            placeholder: "输入备注...",
            actionText: "保存备注"
          });
          if (v != null) {
            blockedUsers_default.update(id, {
              note: v
            });
          }
        })}>
                        ${name}
                        <div class="whitespace-nowrap truncate text-xs font-serif" title="${note}">
                          ${note}
                        </div>
                      </td>
                      <td
                      >
                 
                        <div class="transition opacity-0 group-hover:opacity-100 space-x-2 text-center">
                          <a
                            href="https://space.bilibili.com/${id}"
                            target="_blank"
                            class="inline-flex underline text-blue-500"
                          >
                            <svg 
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em]"
                            >
                              <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiOpenInNew} fill="currentColor">
                            </svg>
                            <span>个人空间</span>
                          </a>
                          <button
                            type="button"
                            @click=${() => blockedUsers_default.remove(id)}
                            class="inline-flex underline"
                          >
                            <svg 
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em]"
                            >
                              <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCheckOutline} fill="currentColor">
                            </svg>
                            <span>取消屏蔽</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
      })}
            </tbody>
          </table>
        </div>
      </div>
    `;
    }
    liveRoomTable() {
      const liveRoomIDs = blockedLiveRooms_default.distinctID();
      return html`
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽直播间 <span class="text-sm">(${liveRoomIDs.length})</span>
        </h1>
        <div class="flex-1 overflow-auto relative">
          <table class="table-fixed border-separate border-spacing-2 w-full">
            <thead class="sticky top-0">
              <tr class="bg-gray-200 text-center">
                <td>屏蔽时间</td>
                <td>所有者</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              ${liveRoomIDs.map(blockedLiveRooms_default.get).sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.id, b.id);
      }).map(({ id, owner, blockedAt }) => {
        return html`
                    <tr class="group even:bg-gray-100">
                      <td class="text-right w-32">
                       <time datetime="${blockedAt.toISOString()}">
                          ${blockedAt.toLocaleString()}
                        </time>
                      </td>
                      <td class="text-center">${owner}</td>
                      <td
                        class="transition opacity-0 group-hover:opacity-100 space-x-2 text-center"
                      >
                        <a
                          href="https://live.bilibili.com/${id}"
                          target="_blank"
                          class="inline-flex underline text-blue-500"
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiOpenInNew} fill="currentColor">
                          </svg>
                          <span>前往</span>
                        </a>
                        <button
                          type="button"
                          @click=${() => blockedLiveRooms_default.remove(id)}
                          class="inline-flex underline"
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiCheck} fill="currentColor">
                          </svg>
                          <span>取消屏蔽</span>
                        </button>
                      </td>
                    </tr>
                  `;
      })}
            </tbody>
          </table>
        </div>
      </div>
    `;
    }
  };
  __publicField(_SettingsDrawer, "id", `settings-${randomUUID()}`);
  var SettingsDrawer = _SettingsDrawer;

  // src/bilibili.com/components/FullHeaderButton.ts
  var _FullHeaderButton = class _FullHeaderButton {
    constructor(settings) {
      __publicField(this, "settings");
      __publicField(this, "render", () => {
        const parent = document.querySelector(".right-entry");
        if (!parent) {
          return;
        }
        const container = obtainHTMLElementByID({
          tag: "li",
          id: _FullHeaderButton.id,
          onDidCreate: (el) => {
            el.classList.add("right-entry-item");
            parent.prepend(...[parent.firstChild, el].filter(isNonNull));
          }
        });
        render(
          html`
  <button
    type="button"
    class="right-entry__outside" 
    @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.settings.open();
          }}
  >
    <svg viewBox="2 2 20 20" class="right-entry-icon" style="height: 20px; fill: currentColor;">
      <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOffOutline}>
    </svg>
    <span class="right-entry-text">屏蔽</span>
  </button>
`,
          container
        );
      });
      this.settings = settings;
    }
  };
  __publicField(_FullHeaderButton, "id", `full-header-button-${randomUUID()}`);
  var FullHeaderButton = _FullHeaderButton;

  // src/bilibili.com/models/migrate.ts
  function migrateV1() {
    return __async(this, null, function* () {
      const key2 = "blockedUserIDs@7ced1613-89d7-4754-8989-2ad0d7cfa9db";
      const oldValue = yield GM.getValue(key2);
      if (!oldValue) {
        return;
      }
      const newValue = {};
      JSON.parse(String(oldValue)).forEach((i) => {
        newValue[i] = true;
      });
      yield GM.setValue(
        "blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4",
        JSON.stringify(newValue)
      );
      yield GM.deleteValue(key2);
    });
  }
  function migrate() {
    return __async(this, null, function* () {
      yield migrateV1();
    });
  }

  // src/bilibili.com/utils/parseUserURL.ts
  function parseUserURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    switch (url.host) {
      case "space.bilibili.com": {
        const match = /^\/(\d+)\/?/.exec(url.pathname);
        if (!match) {
          return;
        }
        return { id: match[1] };
      }
      case "cm.bilibili.com": {
        const id = url.searchParams.get("space_mid");
        if (id) {
          return { id };
        }
        break;
      }
      default:
    }
  }

  // src/bilibili.com/components/UserBlockButton.ts
  var _UserBlockButton = class _UserBlockButton {
    constructor(user) {
      this.user = user;
      __publicField(this, "render", () => {
        const parentV1 = document.querySelector(".h-action");
        if (parentV1) {
          const container = obtainHTMLElementByID({
            tag: "div",
            id: _UserBlockButton.id,
            onDidCreate: (el) => {
              el.style.display = "inline";
              parentV1.append(...[el, parentV1.lastChild].filter(isNonNull));
            }
          });
          const isBlocked = blockedUsers_default.has(this.user.id);
          render(
            html`
          <span class="h-f-btn" @click=${this.onClick}>
            ${isBlocked ? "取消屏蔽" : "屏蔽"}
          </span>
        `,
            container
          );
          return;
        }
        const parentV2 = document.querySelector(".operations .interactions");
        if (parentV2) {
          const container = obtainHTMLElementByID({
            tag: "div",
            id: _UserBlockButton.id,
            onDidCreate: (el) => {
              el.style.cssText = `cursor: pointer;
display: flex;
justify-content: center;
align-items: center;
width: 150px;
height: 34px;
border-radius: 6px;
font-size: 14px;
font-weight: 700;
color: var(--text_white);
border: 1px solid rgba(255,255,255,.2);
background-color: rgba(255,255,255,.14);
transition: all .3s;
margin-right: 24px;
`;
              el.addEventListener("mouseenter", () => {
                el.style.backgroundColor = "rgba(255,255,255,.4)";
              });
              el.addEventListener("mouseleave", () => {
                el.style.backgroundColor = "rgba(255,255,255,.14)";
              });
              el.addEventListener("click", (e) => {
                this.onClick(e);
              });
              parentV2.append(...[el, parentV2.lastChild].filter(isNonNull));
            }
          });
          const isBlocked = blockedUsers_default.has(this.user.id);
          render(
            html`<span> ${isBlocked ? "取消屏蔽" : "屏蔽"} </span>`,
            container
          );
        }
      });
      __publicField(this, "onClick", (e) => {
        var _a2, _b2;
        e.stopPropagation();
        blockedUsers_default.toggle({
          id: this.user.id,
          name: (_b2 = (_a2 = document.querySelector("#h-name, .nickname")) == null ? void 0 : _a2.innerText) != null ? _b2 : ""
        });
      });
    }
  };
  __publicField(_UserBlockButton, "id", `user-block-button-${randomUUID()}`);
  var UserBlockButton = _UserBlockButton;

  // src/bilibili.com/utils/parseVideoURL.ts
  function parseVideoURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    if (url.host !== "www.bilibili.com") {
      return;
    }
    const match = /^\/video\/(BV[0-9a-zA-Z]+)\/?/.exec(url.pathname);
    if (!match) {
      return;
    }
    return {
      id: match[1]
    };
  }

  // src/utils/setHTMLElementDisplayHidden.ts
  function setHTMLElementDisplayHidden(el, want) {
    const actual = el.style.display === "none";
    if (actual === want) {
      return;
    }
    if (want) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
  }

  // src/utils/injectStyle.ts
  function injectStyle(id, css) {
    obtainHTMLElementByID({
      tag: "style",
      id,
      onDidCreate: (el) => {
        document.head.appendChild(el);
        el.innerHTML = css;
      }
    });
  }

  // src/bilibili.com/components/VideoHoverButton.ts
  var VideoHoverButton = class {
    constructor(parentNode, user) {
      this.parentNode = parentNode;
      this.user = user;
      __publicField(this, "render", () => {
        const { parentNode } = this;
        if (!parentNode) {
          return;
        }
        const parentKey = "dde57f95-0cb5-4443-bbeb-2466d63db0f1";
        const key2 = "a1161956-2be7-4796-9f1b-528707156b11";
        injectStyle(
          parentKey,
          `[data-${parentKey}]:hover [data-${key2}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key2}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        const el = obtainHTMLElementByDataKey({
          tag: "div",
          key: key2,
          parentNode,
          onDidCreate: (el2) => {
            parentNode.setAttribute(`data-${parentKey}`, "");
            parentNode.append(el2);
          }
        });
        const isBlocked = blockedUsers_default.has(this.user.id);
        render(
          html`
<button
  type="button"
  title="${isBlocked ? "取消屏蔽此用户" : "屏蔽此用户"}"
  class="rounded-md cursor-pointer  z-20 border-none ${isBlocked ? "bg-white text-black" : "text-white bg-[rgba(33,33,33,.8)]"}"
  @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isBlocked) {
              blockedUsers_default.remove(this.user.id);
            } else {
              blockedUsers_default.add(this.user);
            }
          }}
>
  <svg viewBox="-3 -1 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${isBlocked ? mdiAccountCheckOutline : mdiAccountCancelOutline}>
  </svg>
</button>
    `,
          obtainStyledShadowRoot(el)
        );
      });
    }
  };

  // src/bilibili.com/components/VideoDetailPatch.ts
  var VideoDetailPatch = class {
    constructor(ctx) {
      this.ctx = ctx;
      __publicField(this, "blockedTitles", /* @__PURE__ */ new Set());
      __publicField(this, "render", () => {
        document.querySelectorAll(".video-page-card-small").forEach((i) => {
          var _a2, _b2, _c2, _d2, _e, _f, _g;
          const rawURL = (_a2 = i.querySelector(".upname a")) == null ? void 0 : _a2.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let hidden = false;
          let note = "";
          if (user) {
            const duration = (_d2 = (_c2 = (_b2 = i.querySelector(".duration")) == null ? void 0 : _b2.textContent) == null ? void 0 : _c2.trim()) != null ? _d2 : "";
            const titleEl = i.querySelector(".title");
            const title = (_e = (titleEl == null ? void 0 : titleEl.getAttribute("title")) || (titleEl == null ? void 0 : titleEl.textContent)) != null ? _e : "";
            if (title) {
              note = `${title}`;
            }
            const video = parseVideoURL(
              (_f = titleEl == null ? void 0 : titleEl.parentElement) == null ? void 0 : _f.getAttribute("href")
            );
            if (video == null ? void 0 : video.id) {
              note += `(${video.id})`;
            }
            hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
            if (hidden) {
              this.blockedTitles.add(title);
            }
          } else {
            hidden = !videoListSettings_default.allowAdvertisement;
          }
          setHTMLElementDisplayHidden(i, hidden);
          if (user && !hidden) {
            new VideoHoverButton(i.querySelector(".pic-box"), {
              id: user.id,
              name: ((_g = i.querySelector(".upname .name")) == null ? void 0 : _g.textContent) || user.id,
              note
            }).render();
          }
        });
        document.querySelectorAll(".bpx-player-ending-related-item").forEach((i) => {
          var _a2;
          const title = (_a2 = i.querySelector(
            ".bpx-player-ending-related-item-title"
          )) == null ? void 0 : _a2.textContent;
          if (!title) {
            return;
          }
          const hidden = this.blockedTitles.has(title) || this.ctx.shouldExcludeVideo({ title });
          setHTMLElementDisplayHidden(i, hidden);
        });
      });
    }
  };

  // src/bilibili.com/components/SSRVideoRankPatch.ts
  var SSRVideoRankPatch = class {
    constructor() {
      __publicField(this, "render", () => {
        document.querySelectorAll(".rank-item").forEach((i) => {
          var _a2, _b2, _c2, _d2;
          const user = parseUserURL(
            (_b2 = (_a2 = i.querySelector(".up-name")) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.getAttribute("href")
          );
          if (!user) {
            return;
          }
          const name = (_d2 = (_c2 = i.querySelector(".up-name")) == null ? void 0 : _c2.textContent) != null ? _d2 : "";
          const isBlocked = blockedUsers_default.has(user.id);
          setHTMLElementDisplayHidden(i, isBlocked);
          if (!isBlocked) {
            new VideoHoverButton(i.querySelector(".img"), {
              id: user.id,
              name
            }).render();
          }
        });
      });
    }
  };

  // src/utils/castPlainObject.ts
  function castPlainObject(value) {
    if (isPlainObject_default(value)) {
      return value;
    }
    return { value };
  }

  // src/utils/evalInContentScope.ts
  function evalInContentScope(javascript) {
    try {
      return JSON.parse(
        window.eval(`JSON.stringify(eval(${JSON.stringify(javascript)}))`)
      );
    } catch (err) {
      return err;
    }
  }

  // src/utils/getElementSelector.ts
  var attributeName = `data-select-${randomUUID()}`;
  var nextValue = 1;
  function getElementSelector(el) {
    let v = el.getAttribute(attributeName);
    if (!v) {
      v = nextValue.toString();
      nextValue += 1;
      el.setAttribute(attributeName, v);
    }
    return `[${attributeName}='${v}']`;
  }

  // src/bilibili.com/components/VueVideoRankPatch.ts
  var VueVideoRankPatch = class {
    constructor() {
      __publicField(this, "render", () => {
        document.querySelectorAll(".video-card").forEach((i) => {
          const selector = getElementSelector(i);
          const videoData = evalInContentScope(
            `document.querySelector(${JSON.stringify(
              selector
            )}).__vue__._props.videoData`
          );
          const { owner, title, bvid } = castPlainObject(videoData);
          const { mid, name } = castPlainObject(owner);
          if (typeof mid !== "number" || typeof name !== "string") {
            return;
          }
          const userID = mid.toString();
          const isBlocked = blockedUsers_default.has(userID);
          setHTMLElementDisplayHidden(i, isBlocked);
          if (!isBlocked) {
            new VideoHoverButton(i.querySelector(".video-card__content"), {
              id: userID,
              name,
              note: (typeof title === "string" ? title : "") + (typeof bvid === "string" ? `(${bvid})` : "")
            }).render();
          }
        });
      });
    }
  };

  // src/bilibili.com/components/VideoListPatch.ts
  var _VideoListPatch = class _VideoListPatch {
    constructor(ctx) {
      this.ctx = ctx;
      __publicField(this, "disabled", false);
      __publicField(this, "render", () => {
        let matchCount = 0;
        let listEl;
        document.querySelectorAll(".bili-video-card").forEach((i) => {
          var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i, _j, _k;
          const rawURL = (_a2 = i.querySelector("a.bili-video-card__info--owner")) == null ? void 0 : _a2.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let match = false;
          let note = "";
          if (user) {
            const duration = (_d2 = (_c2 = (_b2 = i.querySelector(".bili-video-card__stats__duration")) == null ? void 0 : _b2.textContent) == null ? void 0 : _c2.trim()) != null ? _d2 : "";
            const titleEl = i.querySelector(".bili-video-card__info--tit");
            const title = (_e = (titleEl == null ? void 0 : titleEl.getAttribute("title")) || (titleEl == null ? void 0 : titleEl.textContent)) != null ? _e : "";
            if (title) {
              note = `${title}`;
            }
            const video = parseVideoURL(
              (_h = (_f = titleEl == null ? void 0 : titleEl.parentElement) == null ? void 0 : _f.getAttribute("href")) != null ? _h : (_g = titleEl == null ? void 0 : titleEl.querySelector("a")) == null ? void 0 : _g.getAttribute("href")
            );
            if (video == null ? void 0 : video.id) {
              note += `(${video.id})`;
            }
            const isPromoted = i.classList.contains("is-rcmd") && !i.classList.contains("enable-no-interest");
            match = this.ctx.shouldExcludeVideo({
              user,
              duration,
              title,
              isPromoted
            });
          } else {
            match = !videoListSettings_default.allowAdvertisement;
          }
          if (match) {
            matchCount += 1;
          }
          let container = i;
          while (((_i = container.parentElement) == null ? void 0 : _i.childElementCount) === 1 || ((_j = container.parentElement) == null ? void 0 : _j.classList.values().some((cls) => _VideoListPatch.knownParentContainerClass.has(cls)))) {
            container = container.parentElement;
          }
          listEl = container.parentElement || void 0;
          const hidden = !this.disabled && match;
          setHTMLElementDisplayHidden(container, hidden);
          if (user && !hidden) {
            new VideoHoverButton(i.querySelector(".bili-video-card__image--wrap"), {
              id: user.id,
              name: ((_k = i.querySelector(".bili-video-card__info--author")) == null ? void 0 : _k.textContent) || user.id,
              note
            }).render();
          }
        });
        render(
          matchCount === 0 ? nothing : html`
            <div class="w-full text-gray-500 text-center m-1">
              ${this.disabled ? html`${matchCount} 条视频符合屏蔽规则` : html`已屏蔽 ${matchCount} 条视频`}
              <button
                type="button"
                class="border rounded py-1 px-2 text-black hover:bg-gray-200 transition ease-in-out duration-200"
                @click=${() => {
            this.disabled = !this.disabled;
          }}
              >
                ${this.disabled ? "屏蔽" : "全部显示"}
              </button>
            </div>
          `,
          obtainStyledShadowRoot(
            obtainHTMLElementByID({
              id: `video-list-patch-status-${_VideoListPatch.id}`,
              tag: "div",
              onDidCreate: (el) => {
                var _a2;
                (_a2 = listEl == null ? void 0 : listEl.parentElement) == null ? void 0 : _a2.insertBefore(el, listEl);
              }
            })
          )
        );
      });
    }
  };
  __publicField(_VideoListPatch, "id", randomUUID());
  __publicField(_VideoListPatch, "knownParentContainerClass", /* @__PURE__ */ new Set([
    "bili-feed-card",
    "feed-card"
  ]));
  var VideoListPatch = _VideoListPatch;

  // src/bilibili.com/components/AdblockTipPatch.ts
  var AdblockTipPatch = class {
    constructor() {
      __publicField(this, "render", () => {
        const el = document.querySelector(".adblock-tips");
        if (el instanceof HTMLElement) {
          setHTMLElementDisplayHidden(el, !homePageSettings_default.allowAdblockTips);
        }
      });
    }
  };

  // src/bilibili.com/components/HomePageFloorCardHoverButton.ts
  var HomePageFloorCardHoverButton = class {
    constructor(parentNode, floorCard) {
      this.parentNode = parentNode;
      this.floorCard = floorCard;
      __publicField(this, "render", () => {
        const { parentNode } = this;
        if (!parentNode) {
          return;
        }
        const parentKey = "51d5da07-ab2d-4342-8496-c3c53980bb74";
        const key2 = "85e3e435-2ad2-4a7d-839f-69318799db0f";
        injectStyle(
          parentKey,
          `[data-${parentKey}]:hover [data-${key2}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key2}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        const el = obtainHTMLElementByDataKey({
          tag: "div",
          key: key2,
          parentNode,
          onDidCreate: (el2) => {
            parentNode.setAttribute(`data-${parentKey}`, "");
            parentNode.append(el2);
          }
        });
        render(
          html`
<button
  type="button"
  title="屏蔽此频道的楼层卡片"
  class="absolute top-2 left-2 rounded-md cursor-pointer text-white bg-[rgba(33,33,33,.8)] z-20 border-none"
  @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            homePageSettings_default.floorCard.excludeByChannel = [
              ...homePageSettings_default.floorCard.excludeByChannel,
              this.floorCard.channel
            ];
          }}
>
  <svg viewBox="-2 -2 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOff}>
  </svg>
</button>
    `,
          obtainStyledShadowRoot(el)
        );
      });
    }
  };

  // src/bilibili.com/components/HomePageFloorCardPatch.ts
  var HomePageFloorCardPatch = class {
    constructor() {
      __publicField(this, "render", () => {
        document.querySelectorAll(".floor-single-card").forEach((el) => {
          var _a2, _b2;
          const channel = (_b2 = (_a2 = el.querySelector(".floor-title")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.trim();
          if (!channel) {
            return;
          }
          const i = { channel };
          const hidden = homePageSettings_default.floorCard.shouldExclude(i);
          setHTMLElementDisplayHidden(el, hidden);
          if (!hidden) {
            new HomePageFloorCardHoverButton(
              el.querySelector(".cover-container"),
              i
            ).render();
          }
        });
      });
    }
  };

  // src/utils/ExactSearchMatcher.ts
  var ExactSearchMatcher = class {
    constructor(q) {
      __publicField(this, "keywords");
      __publicField(this, "match", (...searchKey) => {
        if (this.keywords.length === 0) {
          return true;
        }
        return this.keywords.every((i) => {
          return searchKey.some((j) => j.toLowerCase().includes(i));
        });
      });
      this.keywords = q.split(/\s/).map((i) => i.trim().toLowerCase()).filter((i) => i);
    }
  };

  // src/bilibili.com/Context.ts
  var Context = class {
    constructor({ query }) {
      __publicField(this, "m");
      __publicField(this, "query");
      __publicField(this, "shouldExcludeVideo", (v) => {
        if (v.isPromoted && !videoListSettings_default.allowPromoted) {
          return true;
        }
        if (v.user && blockedUsers_default.has(v.user.id)) {
          return true;
        }
        if (v.duration) {
          const durationMs = Duration.cast(v.duration).toMilliseconds();
          if (durationMs <= 0) {
          } else if (videoListSettings_default.durationGte.valid && !(durationMs >= videoListSettings_default.durationGte.toMilliseconds())) {
            return true;
          } else if (videoListSettings_default.durationLt.valid && !(durationMs < videoListSettings_default.durationLt.toMilliseconds())) {
            return true;
          }
        }
        if (this.query && v.title && searchSettings_default.strictTitleMatch) {
          if (!this.m.match(v.title)) {
            return true;
          }
        }
        if (v.title && videoListSettings_default.excludeKeywords.some(
          (i) => v.title.toLowerCase().includes(i.toLowerCase())
        )) {
          return true;
        }
        return false;
      });
      __publicField(this, "shouldExcludeLiveRoom", (v) => {
        if (v.owner && blockedUsers_default.has(v.owner.id)) {
          return true;
        }
        if (v.room && blockedLiveRooms_default.has(v.room.id)) {
          return true;
        }
        return false;
      });
      this.query = query;
      this.m = new ExactSearchMatcher(query);
    }
  };

  // src/bilibili.com/components/MiniHeaderButton.ts
  var _MiniHeaderButton = class _MiniHeaderButton {
    constructor(settings) {
      __publicField(this, "settings");
      __publicField(this, "render", () => {
        const parent = document.querySelector(
          ".nav-user-center .user-con:nth-child(2)"
        );
        if (!parent) {
          return;
        }
        const container = obtainHTMLElementByID({
          tag: "div",
          id: _MiniHeaderButton.id,
          onDidCreate: (el) => {
            el.classList.add("item");
            parent.prepend(...[parent.firstChild, el].filter(isNonNull));
          }
        });
        render(
          html`
        <div
          @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.settings.open();
          }}
        >
          <span class="name">屏蔽</span>
        </div>
      `,
          container
        );
      });
      this.settings = settings;
    }
  };
  __publicField(_MiniHeaderButton, "id", `mini-header-button-${randomUUID()}`);
  var MiniHeaderButton = _MiniHeaderButton;

  // src/bilibili.com/components/PlaylistPatch.ts
  var PlaylistPatch = class {
    constructor(ctx) {
      this.ctx = ctx;
      __publicField(this, "render", () => {
        document.querySelectorAll(".video-card").forEach((i) => {
          var _a2, _b2, _c2, _d2, _e, _f, _g, _h;
          const rawURL = (_a2 = i.querySelector("a.upname")) == null ? void 0 : _a2.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let hidden = false;
          if (user) {
            const duration = (_d2 = (_c2 = (_b2 = i.querySelector(".duration")) == null ? void 0 : _b2.textContent) == null ? void 0 : _c2.trim()) != null ? _d2 : "";
            const title = (_g = ((_e = i.querySelector(".title")) == null ? void 0 : _e.getAttribute("title")) || ((_f = i.querySelector(".title")) == null ? void 0 : _f.textContent)) != null ? _g : "";
            hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
          } else {
            hidden = !videoListSettings_default.allowAdvertisement;
          }
          setHTMLElementDisplayHidden(i, hidden);
          if (user && !hidden) {
            new VideoHoverButton(i.querySelector(".pic-box"), {
              id: user.id,
              name: ((_h = i.querySelector(".upname .name")) == null ? void 0 : _h.textContent) || user.id
            }).render();
          }
        });
      });
    }
  };

  // src/bilibili.com/utils/parseLiveRoomURL.ts
  function parseLiveRoomURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    switch (url.host) {
      case "live.bilibili.com": {
        const match = /^\/(\d+)\/?/.exec(url.pathname);
        if (!match) {
          return;
        }
        return { id: match[1] };
      }
      default:
    }
  }

  // src/bilibili.com/components/LiveRoomHoverButton.ts
  var LiveRoomHoverButton = class {
    constructor(parentNode, room) {
      this.parentNode = parentNode;
      this.room = room;
      __publicField(this, "render", () => {
        const { parentNode } = this;
        if (!parentNode) {
          return;
        }
        const parentKey = "321c1408-3ba8-4f8e-8ec8-4c491cf648c6";
        const key2 = "c2ad7200-7141-46cd-a0ce-ba71ca52e396";
        injectStyle(
          parentKey,
          `[data-${parentKey}]:hover [data-${key2}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key2}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        const el = obtainHTMLElementByDataKey({
          tag: "div",
          key: key2,
          parentNode,
          onDidCreate: (el2) => {
            parentNode.setAttribute(`data-${parentKey}`, "");
            parentNode.append(el2);
          }
        });
        const isBlocked = blockedLiveRooms_default.has(this.room.id);
        render(
          html`
  <button
    type="button"
    title="${isBlocked ? "取消屏蔽此直播间" : "屏蔽此直播间"}"
    class="absolute top-2 left-2 p-1 rounded-md cursor-pointer isolate border-none ${isBlocked ? "bg-white text-black" : "text-white bg-[rgba(33,33,33,.8)]"}"
    style="z-index: 200;"
    @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockedLiveRooms_default.toggle(this.room, !isBlocked);
          }}
  >
    <svg viewBox="0 0 24 24" class="h-8 fill-current">
      <path fill-rule="evenodd" clip-rule="evenodd" d=${isBlocked ? mdiCheckCircleOutline : mdiCancel}>
    </svg>
  </button>
    `,
          obtainStyledShadowRoot(el)
        );
      });
    }
  };

  // src/bilibili.com/components/LiveRoomListPatch.ts
  var _LiveRoomPatch = class _LiveRoomPatch {
    constructor(ctx) {
      this.ctx = ctx;
      __publicField(this, "disabled", false);
      __publicField(this, "render", () => {
        let matchCount = 0;
        let listEl;
        document.querySelectorAll("a#card").forEach((i) => {
          var _a2, _b2;
          const rawURL = i.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const room = parseLiveRoomURL(rawURL);
          if (!room) {
            return;
          }
          const match = this.ctx.shouldExcludeLiveRoom({ room });
          if (match) {
            matchCount += 1;
          }
          let container = i;
          while (((_a2 = container.parentElement) == null ? void 0 : _a2.childElementCount) === 1) {
            container = container.parentElement;
          }
          listEl = container.parentElement || void 0;
          const hidden = !this.disabled && match;
          setHTMLElementDisplayHidden(container, hidden);
          if (!hidden) {
            new LiveRoomHoverButton(i.querySelector(".Item_cover-wrap_BmU4h"), {
              id: room.id,
              owner: ((_b2 = i.querySelector(".Item_nickName_KO2QE")) == null ? void 0 : _b2.textContent) || room.id
            }).render();
          }
        });
        render(
          matchCount === 0 ? nothing : html`
            <div class="w-full text-gray-500 text-center m-1">
              ${this.disabled ? html`${matchCount} 个直播间符合屏蔽规则` : html`已屏蔽 ${matchCount} 个直播间`}
              <button
                type="button"
                class="border rounded py-1 px-2 text-black hover:bg-gray-200 transition ease-in-out duration-200"
                @click=${() => {
            this.disabled = !this.disabled;
          }}
              >
                ${this.disabled ? "屏蔽" : "全部显示"}
              </button>
            </div>
          `,
          obtainStyledShadowRoot(
            obtainHTMLElementByID({
              id: `live-room-list-patch-status-${_LiveRoomPatch.id}`,
              tag: "div",
              onDidCreate: (el) => {
                var _a2;
                (_a2 = listEl == null ? void 0 : listEl.parentElement) == null ? void 0 : _a2.insertBefore(el, listEl);
              }
            })
          )
        );
      });
    }
  };
  __publicField(_LiveRoomPatch, "id", randomUUID());
  var LiveRoomPatch = _LiveRoomPatch;

  // src/bilibili.com/components/LiveHeaderButton.ts
  var _LiveHeaderButton = class _LiveHeaderButton {
    constructor(settings) {
      __publicField(this, "settings");
      __publicField(this, "render", () => {
        const parent = document.querySelector(".link-navbar");
        if (!parent) {
          return;
        }
        const container = obtainHTMLElementByID({
          tag: "div",
          id: _LiveHeaderButton.id,
          onDidCreate: (el) => {
            el.style.fontSize = "14px";
            parent.append(...[el, parent.lastChild].filter(isNonNull));
          }
        });
        render(
          html`
      <div
        style="display: flex; align-items: center; margin: 0 20px;flex-direction: column;gap: 4px;padding: 12px;font-size: 14px; cursor: pointer;"
        @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.settings.open();
          }}
      >
        <svg viewBox="2 2 20 20" style="height: 20px; fill: currentColor;">
          <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiEyeOffOutline}>
        </svg>
        <span>屏蔽</span>
      </div>
      `,
          container
        );
      });
      this.settings = settings;
    }
  };
  __publicField(_LiveHeaderButton, "id", `live-header-button-${randomUUID()}`);
  var LiveHeaderButton = _LiveHeaderButton;

  // src/bilibili.com/block.user.ts
  function createApp() {
    return __async(this, null, function* () {
      var _a2;
      const rawURL = window.location.href;
      const settings = new SettingsDrawer();
      const components = [settings];
      const user = parseUserURL(rawURL);
      const url = new URL(rawURL);
      let headerButton;
      yield waitUntil({
        ready: () => {
          var _a3, _b2, _c2, _d2;
          if (((_b2 = (_a3 = document.querySelector(".right-entry")) == null ? void 0 : _a3.childElementCount) != null ? _b2 : 0) >= 2) {
            headerButton = new FullHeaderButton(settings);
            return true;
          }
          if (((_d2 = (_c2 = document.querySelector(".nav-user-center .user-con:nth-child(2)")) == null ? void 0 : _c2.childElementCount) != null ? _d2 : 0) >= 2) {
            headerButton = new MiniHeaderButton(settings);
            return true;
          }
          if (document.querySelector(".link-navbar .right-part")) {
            headerButton = new LiveHeaderButton(settings);
            return true;
          }
          return false;
        }
      });
      if (headerButton) {
        components.push(headerButton);
      }
      const data = {
        query: ""
      };
      if (url.host === "search.bilibili.com") {
        data.query = (_a2 = url.searchParams.get("keyword")) != null ? _a2 : "";
      }
      const ctx = new Context(data);
      if (user) {
        components.push(new UserBlockButton(user));
      } else if (parseVideoURL(rawURL)) {
        components.push(new VideoDetailPatch(ctx));
      } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/rank/all")) {
        components.push(new SSRVideoRankPatch());
      } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/")) {
        components.push(new VueVideoRankPatch());
      } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/list/")) {
        components.push(new PlaylistPatch(ctx));
      } else if (url.host === "live.bilibili.com") {
        components.push(new LiveRoomPatch(ctx), new VideoListPatch(ctx));
      } else {
        components.push(new VideoListPatch(ctx));
      }
      if (url.host === "www.bilibili.com" && url.pathname === "/") {
        components.push(new AdblockTipPatch(), new HomePageFloorCardPatch());
      }
      return {
        render: () => components.forEach((i) => i.render())
      };
    });
  }
  function routeKey() {
    var _a2;
    const { host, pathname, search } = window.location;
    if (host === "search.bilibili.com") {
      const q = new URLSearchParams(search);
      return `search:${(_a2 = q.get("keyword")) != null ? _a2 : ""}`;
    }
    return pathname;
  }
  function main() {
    return __async(this, null, function* () {
      yield migrate();
      const initialRouteKey = routeKey();
      const app = yield createApp();
      const d2 = new Disposal();
      d2.push(
        new Polling({
          update: () => {
            if (routeKey() !== initialRouteKey) {
              d2.dispose();
              main();
              return;
            }
            app.render();
          },
          scheduleNext: (update) => setTimeout(update, 100)
        })
      );
    });
  }
  onDocumentReadyOnce(main);
})();
/*! Bundled license information:

lit-html/development/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
