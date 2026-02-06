import injectStyle from '@/utils/injectStyle';
import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';

import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import { mount } from 'svelte';
import VideoHoverButton from './VideoHoverButton.svelte';

const instances = new WeakMap<HTMLElement, VideoHoverButton>();

export default function renderVideoHoverButton(
  parentNode: Element,
  user: { id: string; name: string; note: string }
) {
  const parentKey = 'dde57f95-0cb5-4443-bbeb-2466d63db0f1';
  const key = 'a1161956-2be7-4796-9f1b-528707156b11';
  injectStyle(
    parentKey,
    `\
[data-${parentKey}]:hover [data-${key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${parentKey}] [data-${key}] {
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
    tag: 'div',
    key,
    parentNode,
    onDidCreate: (el) => {
      parentNode.setAttribute(`data-${parentKey}`, '');
      parentNode.append(el);
      const s = mount(VideoHoverButton, {
        target: obtainStyledShadowRoot(el),
        props: { user },
      });
      instances.set(el, s);
    },
  });
  instances.get(el)?.setUser(user);
}
