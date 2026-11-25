// Desktop embeds binary assets. The Android WebView streams the same files from the APK.
export async function assetBuffer(source) {
  if (typeof source !== 'string') return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const response = await fetch(source);
  if (!response.ok) throw Error('本地素材暂时无法读取');
  return response.arrayBuffer();
}
