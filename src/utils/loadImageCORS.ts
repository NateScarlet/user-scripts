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
        let objectUrl: string | undefined;
        try {
          const headers = parseHeader(responseHeaders);
          const u8 = new Uint8Array(responseText.length);
          for (let i = 0; i < responseText.length; i++) {
            u8[i] = responseText.charCodeAt(i);
          }
          const data = new Blob([u8], {
            type: headers.get('content-type')?.[0] ?? 'image/jpeg',
          });
          objectUrl = URL.createObjectURL(data);
          const img = new Image();
          img.src = objectUrl;
          img.alt = url;
          await img.decode(); // 解码完成后就不再需要 blob URL 了
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
      },
    });
  });
}
