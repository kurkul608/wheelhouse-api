export function chunkArray<T>(array: Array<T>, chunkSize = 10) {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
    array.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
}
