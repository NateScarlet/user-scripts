export default async function readLineStream({
  stream,
  encoding = 'utf-8',
  onLine,
}: {
  stream: ReadableStream<Uint8Array>;
  encoding?: string;
  onLine: (line: string) => Promise<void> | void;
}): Promise<void> {
  const reader = stream.getReader();
  try {
    let buffer = '';
    const decoder = new TextDecoder(encoding);
    while (true) {
      const { value, done } = await reader.read();

      // 处理最后一行 (当流结束时)
      if (done) {
        if (buffer) {
          await onLine(buffer);
        }
        return;
      }

      // 解码数据块（使用流模式保证多字节字符安全）
      const text = decoder.decode(value, { stream: true });
      let lineStart = 0;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
          // 组合缓冲区和当前行的内容
          const fullLine = buffer + text.substring(lineStart, i);
          buffer = ''; // 重置缓冲区
          lineStart = i + 1; // 跳过换行符

          // 处理完整行
          await onLine(fullLine);
        }
      }

      // 保存未完成的行部分
      buffer += text.substring(lineStart);
    }
  } finally {
    // 确保在任何情况下都释放资源
    reader.releaseLock();
  }
}
