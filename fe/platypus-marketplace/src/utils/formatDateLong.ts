export const formatDateLong = (date: number | string) => {
  const dateFormat = new Date(date);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = dateFormat.getFullYear();
  const month = dateFormat.getMonth();
  const day = dateFormat.getDate();
  //    const hours = dateFormat.getHours();
  //    const minutes = dateFormat.getMinutes();

  return `${day} ${months[month]} ${year}`;
};
