/// <reference types="node" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const utils = require("@typescript-eslint/utils");

/** @type {import('eslint').ESLint.Plugin} */
module.exports = {
  configs: {
    recommended: {
      rules: {
        "internal/no-private-identifier": "error",
        "internal/prefer-instance-function": "error",
      },
    },
  },
  rules: {
    "no-private-identifier": {
      meta: {
        type: "suggestion",
        docs: {
          url: "https://google.github.io/styleguide/tsguide.html#private-fields",
        },
      },
      create: (ctx) => ({
        PrivateIdentifier: (node) => {
          ctx.report({
            node,
            message: "use Typescript visibility annotations instead",
          });
        },
      }),
    },
    /** @type {utils.TSESLint.RuleModule} */
    "prefer-instance-function": {
      meta: {
        type: "suggestion",
        hasSuggestions: true,
        fixable: "code",
        docs: {
          url: "https://github.com/Microsoft/TypeScript/wiki/%27this%27-in-TypeScript#use-instance-functions",
        },
      },
      create: (ctx) => {
        return {
          /** @type {utils.TSESLint.RuleListener['MethodDefinition']} */
          "MethodDefinition[kind=method]:matches(:not([accessibility]),[accessibility=public])":
            (node) => {
              if (node.value.generator) {
                // generator is unlikely to used as callback
                return;
              }
              ctx.report({
                node,
                message:
                  "should use instance function if method can be used as callback",
                fix: (fixer) => {
                  return [
                    fixer.insertTextBefore(node.value.body, "=> "),
                    fixer.replaceTextRange(
                      [node.range[0], node.key.range[1]],
                      `public readonly ${node.key.name} = ${
                        node.value.async ? "async " : ""
                      }`
                    ),
                  ];
                },
                suggest: [
                  {
                    desc: "mark as private",
                    fix: (fixer) => {
                      return fixer.insertTextBefore(node.key, "private ");
                    },
                  },
                  {
                    desc: "mark as protected",
                    fix: (fixer) => {
                      return fixer.insertTextBefore(node.key, "protected ");
                    },
                  },
                ],
              });
            },
        };
      },
    },
  },
};
