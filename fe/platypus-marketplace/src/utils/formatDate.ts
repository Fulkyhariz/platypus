export const formatDate = (date: number | string) => {
  const dateFormat = new Date(date);
  const year = dateFormat.getFullYear();
  const month = dateFormat.getMonth();
  const day = dateFormat.getDate();

  return `${day < 10 ? `0${day}` : day}/${
    month + 1 < 10 ? `0${month + 1}` : month + 1
  }/${year}`;
};

export const formatDateYMD = (date: number | string) => {
  const dateFormat = new Date(date);
  const year = dateFormat.getFullYear();
  const month = dateFormat.getMonth();
  const day = dateFormat.getDate();

  return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
    day < 10 ? `0${day}` : day
  }`;
};
