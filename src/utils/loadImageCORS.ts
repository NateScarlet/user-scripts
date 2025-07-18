import 'core-js/actual/disposable-stack';
import 'core-js/actual/iterator';
import parseHeader from './parseHeader';

export default async function loadImageCORS(
  url: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject): void => {
    GM.xmlHttpRequest({
      method: 'GET',
      url,
      // https://github.com/greasemonkey/greasemonkey/issues/1834#issuecomment-37084558
      overrideMimeType: 'text/plain; charset=x-user-defined',
      onload: async ({ responseText, responseHeaders }) => {
        using stack = new DisposableStack();
        try {
          const headers = parseHeader(responseHeaders);
          const data = new Blob(
            [
              Uint8Array.from(
                Iterator.from(responseText).map((i) => i.charCodeAt(0))
              ),
            ],
            { type: headers.get('content-type')?.[0] ?? 'image/jpeg' }
          );
          const src = stack.adopt(
            URL.createObjectURL(data),
            URL.revokeObjectURL
          );
          const img = new Image();
          img.src = src;
          img.alt = url;
          await img.decode(); // 解码完成后就不再需要 blob URL 了
          resolve(img);
        } catch (err) {
          reject(err);
        }
      },
      onerror: (response) => {
        reject(response);
      },
    });
  });
}
