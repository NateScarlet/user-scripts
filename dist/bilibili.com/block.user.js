// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 避免看到指定用户上传的视频，在用户个人主页和视频左上角会多出屏蔽按钮。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @run-at   document-start
// @version   2023.06.17+13e81070
// ==/UserScript==

(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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

  // src/utils/obtainHTMLElementByID.ts
  function obtainHTMLElementByID(tag2, id, { onCreate } = {}) {
    const match = document.getElementById(id);
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.id = id;
    onCreate == null ? void 0 : onCreate(el);
    return el;
  }

  // src/utils/usePolling.ts
  function usePolling({
    update,
    scheduleNext = requestAnimationFrame
  }) {
    let isCancelled = false;
    function run() {
      return __async(this, null, function* () {
        if (isCancelled) {
          return;
        }
        yield update();
        scheduleNext(run);
      });
    }
    function dispose() {
      isCancelled = true;
    }
    run();
    return {
      dispose
    };
  }

  // src/utils/useGMValue.ts
  function useGMValue(key, defaultValue) {
    const state = {
      value: defaultValue,
      loadingCount: 0
    };
    function read() {
      return __async(this, null, function* () {
        if (state.loadingCount > 0) {
          return;
        }
        state.loadingCount += 1;
        try {
          const value = yield GM.getValue(key);
          if (value != null) {
            try {
              state.value = JSON.parse(String(value));
            } catch (e) {
              state.value = defaultValue;
            }
          }
        } finally {
          state.loadingCount -= 1;
        }
      });
    }
    function write() {
      return __async(this, null, function* () {
        state.loadingCount += 1;
        try {
          if (state.value == null) {
            yield GM.deleteValue(key);
          } else {
            yield GM.setValue(key, JSON.stringify(state.value));
          }
        } finally {
          state.loadingCount -= 1;
        }
      });
    }
    read();
    const polling = usePolling({
      update: () => read(),
      scheduleNext: (update) => setTimeout(update, 500)
    });
    return {
      get value() {
        return state.value;
      },
      set value(v) {
        state.value = v;
        write();
      },
      get isLoading() {
        return state.loadingCount > 0;
      },
      dispose: polling.dispose
    };
  }

  // node_modules/lit-html/development/lit-html.js
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
    (_a = global2.litIssuedWarnings) !== null && _a !== void 0 ? _a : global2.litIssuedWarnings = new Set();
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
  var isIterable = (value) => isArray(value) || typeof (value === null || value === void 0 ? void 0 : value[Symbol.iterator]) === "function";
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
      ["_$litType$"]: type,
      strings,
      values
    };
  };
  var html = tag(HTML_RESULT);
  var svg = tag(SVG_RESULT);
  var noChange = Symbol.for("lit-noChange");
  var nothing = Symbol.for("lit-nothing");
  var templateCache = new WeakMap();
  var walker = d.createTreeWalker(d, 129, null, false);
  var sanitizerFactoryInternal = noopSanitizer;
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
    if (!Array.isArray(strings) || !strings.hasOwnProperty("raw")) {
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
    return [
      policy !== void 0 ? policy.createHTML(htmlResult) : htmlResult,
      attrNames
    ];
  };
  var Template = class {
    constructor({ strings, ["_$litType$"]: type }, options) {
      this.parts = [];
      let node;
      let nodeIndex = 0;
      let attrNameIndex = 0;
      const partCount = strings.length - 1;
      const parts = this.parts;
      const [html2, attrNames] = getTemplateHtml(strings, type);
      this.el = Template.createElement(html2, options);
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
    const nextDirectiveConstructor = isPrimitive(value) ? void 0 : value["_$litDirective$"];
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
    get parentNode() {
      return this._$parent.parentNode;
    }
    get _$isConnected() {
      return this._$parent._$isConnected;
    }
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
  var ChildPart = class {
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
    get _$isConnected() {
      var _a2, _b2;
      return (_b2 = (_a2 = this._$parent) === null || _a2 === void 0 ? void 0 : _a2._$isConnected) !== null && _b2 !== void 0 ? _b2 : this.__isConnected;
    }
    get parentNode() {
      let parentNode = wrap(this._$startNode).parentNode;
      const parent = this._$parent;
      if (parent !== void 0 && (parentNode === null || parentNode === void 0 ? void 0 : parentNode.nodeType) === 11) {
        parentNode = parent.parentNode;
      }
      return parentNode;
    }
    get startNode() {
      return this._$startNode;
    }
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
      const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === void 0 && (type.el = Template.createElement(type.h, this.options)), type);
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
          itemParts.push(itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
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
    _$clear(start = wrap(this._$startNode).nextSibling, from) {
      var _a2;
      (_a2 = this._$notifyConnectionChanged) === null || _a2 === void 0 ? void 0 : _a2.call(this, false, true, from);
      while (start && start !== this._$endNode) {
        const n = wrap(start).nextSibling;
        wrap(start).remove();
        start = n;
      }
    }
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
    get _$isConnected() {
      return this._$parent._$isConnected;
    }
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
  ((_d = global2.litHtmlVersions) !== null && _d !== void 0 ? _d : global2.litHtmlVersions = []).push("2.7.3");
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

  // node_modules/.pnpm/@mdi+js@7.2.96/node_modules/@mdi/js/mdi.js
  var mdiAccountCancelOutline = "M10 4A4 4 0 0 0 6 8A4 4 0 0 0 10 12A4 4 0 0 0 14 8A4 4 0 0 0 10 4M10 6A2 2 0 0 1 12 8A2 2 0 0 1 10 10A2 2 0 0 1 8 8A2 2 0 0 1 10 6M10 13C7.33 13 2 14.33 2 17V20H11.5A6.5 6.5 0 0 1 11.03 18.1H3.9V17C3.9 16.36 7.03 14.9 10 14.9C10.5 14.9 11 14.95 11.5 15.03A6.5 6.5 0 0 1 12.55 13.29C11.61 13.1 10.71 13 10 13M17.5 13C15 13 13 15 13 17.5C13 20 15 22 17.5 22C20 22 22 20 22 17.5C22 15 20 13 17.5 13M17.5 14.5C19.16 14.5 20.5 15.84 20.5 17.5C20.5 18.06 20.35 18.58 20.08 19L16 14.92C16.42 14.65 16.94 14.5 17.5 14.5M14.92 16L19 20.08C18.58 20.35 18.06 20.5 17.5 20.5C15.84 20.5 14.5 19.16 14.5 17.5C14.5 16.94 14.65 16.42 14.92 16Z";

  // src/utils/setHTMLElementDisplayHidden.ts
  function setHTMLElementDisplayHidden(el, want) {
    const actual = el.style.display == "none";
    if (actual === want) {
      return;
    }
    if (want) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
  }

  // src/utils/obtainHTMLElementByDataKey.ts
  function obtainHTMLElementByDataKey({
    tag: tag2,
    key,
    parentNode = document,
    onDidCreate
  }) {
    const match = parentNode.querySelector(`[data-${key}]`);
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.setAttribute(`data-${key}`, "");
    onDidCreate == null ? void 0 : onDidCreate(el);
    return el;
  }

  // src/utils/injectStyle.ts
  function injectStyle(id, css) {
    obtainHTMLElementByID("style", id, {
      onCreate: (el) => {
        document.head.appendChild(el);
        el.innerHTML = css;
      }
    });
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

  // src/utils/castPlainObject.ts
  function castPlainObject(value) {
    if (isPlainObject_default(value)) {
      return value;
    }
    return { value };
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

  // src/utils/evalInContentScope.ts
  function evalInContentScope(javascript) {
    try {
      return JSON.parse(window.eval(`JSON.stringify(eval(${JSON.stringify(javascript)}))`));
    } catch (err) {
      return err;
    }
  }

  // src/bilibili.com/block.user.ts
  var blockedUsers = useGMValue("blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4", {});
  function migrateV1() {
    return __async(this, null, function* () {
      const key = "blockedUserIDs@7ced1613-89d7-4754-8989-2ad0d7cfa9db";
      const oldValue = yield GM.getValue(key);
      if (!oldValue) {
        return;
      }
      const newValue = __spreadValues({}, blockedUsers.value);
      JSON.parse(String(oldValue)).forEach((i) => {
        newValue[i] = true;
      });
      blockedUsers.value = newValue;
      yield GM.deleteValue(key);
    });
  }
  function renderActions(userID) {
    const parent = document.querySelector(".h-action");
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID("div", "7ced1613-89d7-4754-8989-2ad0d7cfa9db", {
      onCreate: (el) => {
        el.style.display = "inline";
        parent.append(el, parent.lastChild);
      }
    });
    const isBlocked = !!blockedUsers.value[userID];
    render(html`
      <span
        class="h-f-btn"
        @click=${(e) => {
      var _a2, _b2;
      e.stopPropagation();
      const isBlocked2 = !!blockedUsers.value[userID];
      blockedUsers.value = __spreadProps(__spreadValues({}, blockedUsers.value), {
        [userID]: !isBlocked2 ? {
          name: (_b2 = (_a2 = document.getElementById("h-name")) == null ? void 0 : _a2.innerText) != null ? _b2 : "",
          blockedAt: Date.now()
        } : void 0
      });
    }}
      >
        ${isBlocked ? "取消屏蔽" : "屏蔽"}
      </span>
    `, container);
  }
  function renderNav() {
    const parent = document.querySelector(".right-entry");
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID("li", "db7a644d-1c6c-4078-a9dc-991b15b68014", {
      onCreate: (el) => {
        el.classList.add("right-entry-item");
        parent.prepend(parent.firstChild, el);
      }
    });
    const count = Object.keys(blockedUsers.value).length;
    setHTMLElementDisplayHidden(container, count == 0);
    render(html`
<button
  type="button"
  class="right-entry__outside" 
  @click=${(e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(blockedUsersURL(), "_blank");
    }}
>
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="right-entry-icon">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline} fill="currentColor">
  </svg>
  <span class="right-entry-text">
    <span>屏蔽</span>
    <span>(${count})</span>
  </span>
</button>
`, container);
  }
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
        return match[1];
      }
      case "cm.bilibili.com": {
        return url.searchParams.get("space_mid") || void 0;
      }
    }
  }
  function parseVideoURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    if (url.host !== "www.bilibili.com") {
      return;
    }
    const match = /^\/video\//.exec(url.pathname);
    if (!match) {
      return;
    }
    return {};
  }
  function renderVideoList() {
    document.querySelectorAll(".bili-video-card").forEach((i) => {
      var _a2, _b2, _c2;
      const rawURL = (_a2 = i.querySelector("a.bili-video-card__info--owner")) == null ? void 0 : _a2.getAttribute("href");
      if (!rawURL) {
        return;
      }
      const userID = parseUserURL(rawURL);
      if (!userID) {
        return;
      }
      const isBlocked = !!blockedUsers.value[userID];
      let container = i;
      while (((_b2 = container.parentElement) == null ? void 0 : _b2.childElementCount) === 1) {
        container = i.parentElement;
      }
      setHTMLElementDisplayHidden(container, isBlocked);
      if (!isBlocked) {
        renderHoverButton(i.querySelector(".bili-video-card__image--wrap"), {
          id: userID,
          name: ((_c2 = i.querySelector(".bili-video-card__info--author")) == null ? void 0 : _c2.getAttribute("title")) || userID
        });
      }
    });
  }
  function renderVPopular() {
    document.querySelectorAll(".video-card").forEach((i) => {
      const selector = getElementSelector(i);
      const videoData = evalInContentScope(`document.querySelector(${JSON.stringify(selector)}).__vue__._props.videoData`);
      const { owner } = castPlainObject(videoData);
      const { mid, name } = castPlainObject(owner);
      if (typeof mid != "number" || typeof name !== "string") {
        return;
      }
      const userID = mid.toString();
      const isBlocked = !!blockedUsers.value[userID];
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        renderHoverButton(i.querySelector(".video-card__content"), {
          id: userID,
          name
        });
      }
    });
  }
  function renderVPopularRankAll() {
    document.querySelectorAll(".rank-item").forEach((i) => {
      var _a2, _b2, _c2, _d2;
      const userID = parseUserURL((_b2 = (_a2 = i.querySelector(".up-name")) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.getAttribute("href"));
      if (!userID) {
        return;
      }
      const name = (_d2 = (_c2 = i.querySelector(".up-name")) == null ? void 0 : _c2.textContent) != null ? _d2 : "";
      const isBlocked = !!blockedUsers.value[userID];
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        renderHoverButton(i.querySelector(".img"), {
          id: userID,
          name
        });
      }
    });
  }
  function renderHoverButton(parentNode, user) {
    if (!parentNode) {
      return;
    }
    const key = "a1161956-2be7-4796-9f1b-528707156b11";
    injectStyle(key, `[data-${key}]:hover .group-hover\\:opacity-100 {
  opacity: 100;
  transition: opacity 0.2s linear 0.2s;
}

[data-${key}] .opacity-0 {
  opacity: 0;
  transition: opacity 0.2s linear 0s;
}
`);
    const el = obtainHTMLElementByDataKey({
      tag: "div",
      key,
      parentNode,
      onDidCreate: (el2) => {
        parentNode.setAttribute(`data-${key}`, "");
        parentNode.append(el2);
      }
    });
    render(html`
<button
  type="button"
  class="opacity-0 group-hover:opacity-100" 
  title="屏蔽此用户"
  style="
    position: absolute;
    top: 8px;
    left: 8px;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    color: #fff;
    background-color: rgba(33,33,33,.8);
    z-index: 9;
    border: none;
"  @click=${(e) => {
      e.preventDefault();
      e.stopPropagation();
      blockedUsers.value = __spreadProps(__spreadValues({}, blockedUsers.value), {
        [user.id]: {
          name: user.name,
          blockedAt: Date.now()
        }
      });
    }}
>
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline} fill="currentColor">
  </svg>
</button>
    `, el);
  }
  function renderVideoDetail() {
    const blockedTitles = new Set();
    document.querySelectorAll(".video-page-card-small").forEach((i) => {
      var _a2, _b2, _c2;
      const rawURL = (_a2 = i.querySelector(".upname a")) == null ? void 0 : _a2.getAttribute("href");
      if (!rawURL) {
        return;
      }
      const userID = parseUserURL(rawURL);
      if (!userID) {
        return;
      }
      const isBlocked = !!blockedUsers.value[userID];
      if (isBlocked) {
        const title = (_b2 = i.querySelector(".title[title]")) == null ? void 0 : _b2.getAttribute("title");
        if (title) {
          blockedTitles.add(title);
        }
      }
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        renderHoverButton(i.querySelector(".pic-box"), {
          id: userID,
          name: ((_c2 = i.querySelector(".upname .name")) == null ? void 0 : _c2.textContent) || userID
        });
      }
    });
    document.querySelectorAll(".bpx-player-ending-related-item").forEach((i) => {
      var _a2;
      const title = (_a2 = i.querySelector(".bpx-player-ending-related-item-title")) == null ? void 0 : _a2.textContent;
      if (!title) {
        return;
      }
      const isBlocked = blockedTitles.has(title);
      setHTMLElementDisplayHidden(i, isBlocked);
    });
  }
  function blockedUsersHTML() {
    const userIDs = Object.keys(blockedUsers.value);
    const now = new Date();
    function getData(id) {
      const value = blockedUsers.value[id];
      const { blockedAt: rawBlockedAt = 0, name = id } = typeof value === "boolean" ? {} : value != null ? value : {};
      const blockedAt = new Date(rawBlockedAt);
      return {
        id,
        blockedAt,
        name,
        idAsNumber: Number.parseInt(id),
        isFallback: rawBlockedAt === 0
      };
    }
    return [
      "<html>",
      "<head>",
      "<title>已屏蔽的用户</title>",
      `<script id="data" lang="application/json">
    ${JSON.stringify(blockedUsers.value, void 0, 2)}
    <\/script>`,
      "</head>",
      "<body>",
      "<div>",
      `  <h1>已屏蔽 ${userIDs.length} 用户</h1>`,
      `  <time datetime="${now.toISOString()}">${now.toLocaleString()}</time>`,
      "  <ul>",
      ...userIDs.map(getData).sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.idAsNumber, b.idAsNumber);
      }).map(({ id, name, blockedAt, isFallback }) => {
        return [
          "<li>",
          `<a href="https://space.bilibili.com/${id}" target="_blank">${name}</a>`,
          ...!isFallback ? [
            `<span>屏蔽于<time datetime="${blockedAt.toISOString()}">${blockedAt.toLocaleString()}</time></span>`
          ] : [],
          "</li>"
        ].join("\n");
      }),
      "  </ul>",
      "</div>",
      "</body>",
      "</html>"
    ].join("\n");
  }
  function blockedUsersURL() {
    const b = new Blob([blockedUsersHTML()], {
      type: "text/html;charset=UTF-8"
    });
    return URL.createObjectURL(b);
  }
  function createApp() {
    const rawURL = window.location.href;
    const components = [{ render: renderNav }];
    const userID = parseUserURL(rawURL);
    const url = new URL(rawURL);
    if (userID) {
      components.push({ render: () => renderActions(userID) });
    } else if (parseVideoURL(rawURL)) {
      components.push({ render: renderVideoDetail });
    } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/rank/all")) {
      components.push({ render: renderVPopularRankAll });
    } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/")) {
      components.push({ render: renderVPopular });
    } else {
      components.push({ render: renderVideoList });
    }
    return {
      render: () => components.forEach((i) => i.render())
    };
  }
  function main() {
    return __async(this, null, function* () {
      yield migrateV1();
      const app = createApp();
      usePolling({
        update: () => app.render(),
        scheduleNext: (update) => setTimeout(update, 100)
      });
    });
  }
  main();
})();
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="es" -o ./`
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
