const blankHTML = new Blob(["<html><head></head><body></body></html>"], {
  type: "text/html;charset=UTF-8",
});
export default class PopOutWindow {
  #hooks: {
    onWillOpen: () => void;
    onDidOpen: (win: Window) => void;
    onDidOpenFail: () => void;
    onWillClose: () => void;
    onDidClose: () => void;
  };

  #win?: Window;

  constructor({
    onDidOpen,
    onDidOpenFail = () => undefined,
    onWillClose = () => undefined,
    onWillOpen = () => undefined,
    onDidClose = () => undefined,
  }: {
    onWillOpen?: () => void;
    onDidOpen: (win: Window) => void;
    onDidOpenFail?: () => void;
    onWillClose?: () => void;
    onDidClose?: () => void;
  }) {
    this.#hooks = {
      onWillClose,
      onWillOpen,
      onDidOpen,
      onDidOpenFail,
      onDidClose,
    };
  }

  get isOpen() {
    return this.#win != null;
  }

  open() {
    const newWin = GM.openInTab(URL.createObjectURL(blankHTML)) as
      | Window
      | undefined;
    this.#win = newWin;
    if (!newWin) {
      this.#hooks.onDidOpenFail();
      return;
    }
    if (newWin.document.readyState === "complete") {
      this.#hooks.onDidOpen(newWin);
    } else {
      newWin.addEventListener("load", () => {
        this.#hooks.onDidOpen(newWin);
      });
    }
    newWin.addEventListener("beforeunload", () => {
      this.#hooks.onWillClose();
    });
    newWin.addEventListener("unload", () => {
      this.#hooks.onDidClose();
      this.#win = undefined;
    });
  }
}
