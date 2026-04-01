const elementToComment = new WeakMap<HTMLElement, Comment>();

/**
 * 设置 HTML 元素的显示/隐藏状态。
 * 当隐藏时，会在原地插入一个注释节点作为占位符，并将元素移动到容器末尾，
 * 以避免 CSS 中 nth-of-type 等伪类选择器导致的布局错乱。
 * @param el 要操作的元素
 * @param want 是否隐藏
 */
export default function setHTMLElementDisplayHidden(
  el: HTMLElement,
  want: boolean
) {
  const comment = elementToComment.get(el);
  const isHidden = !!comment;
  if (isHidden === want) {
    return;
  }
  if (want) {
    const placeholder = document.createComment('hidden-element-placeholder');
    el.before(placeholder);
    elementToComment.set(el, placeholder);
    el.style.display = 'none';
    if (el.parentElement) {
      el.parentElement.appendChild(el);
    }
  } else {
    if (comment && comment.parentElement) {
      comment.before(el);
      comment.remove();
    }
    elementToComment.delete(el);
    el.style.display = '';
  }
}
