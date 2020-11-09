export default function transpose(arr2d) {
  if (arr2d.length === 0) {
    return [];
  } else {
    const result = new Array(arr2d[0].length).fill(null).map(_ => []);
    for (let i = 0; i < arr2d.length; ++i) {
      for (let j = 0; j < arr2d[i].length; ++j) {
        result[j][i] = arr2d[i][j];
      }
    }
    return result;
  }
}

export { transpose };
