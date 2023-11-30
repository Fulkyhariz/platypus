export const formatIDR = (balance: string | number) => {
  const format = new Intl.NumberFormat();

  if (typeof balance === "string") {
    const formatted = `Rp${format.format(parseInt(balance))}`;
    return formatted;
  }

  return `Rp${format.format(balance)}`;
};
