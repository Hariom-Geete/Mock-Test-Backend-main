export const generateTempPassword =
() => {

  return `EXAM-${
    Math.floor(
      1000 +
      Math.random() * 9000
    )
  }`;
};