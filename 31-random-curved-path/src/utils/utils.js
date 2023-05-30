export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min
}
export const getRandomFloat = (min, max, decimals) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
}
