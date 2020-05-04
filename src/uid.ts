const uid = (): string => {
  const date = +new Date();
  const a = Math.random().toString(35).substr(2, 5);
  const b = Math.random().toString(35).substr(2, 5);

  return `${date}-${a}-${b}`;
};

export default uid;
