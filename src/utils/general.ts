import fetch from 'node-fetch';

export const replaceAll = (str: string, search: string, replacement: string): string => {
    let split = str.split(search);
    return split.join(replacement);
}

export const pauseExecution = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const deduplicateArray = (arr: Array<any>): Array<any> => {
    return Array.from(new Set(arr));
}

export const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  return `data:${contentType};base64,${buffer.toString('base64')}`;
};