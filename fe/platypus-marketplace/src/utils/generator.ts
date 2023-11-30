export const generateInitialName = (firstname: string, lastname?: string) => {
  const firstNameInit = firstname.split("");
  const lastNameInit = lastname?.split("");

  if (!lastNameInit || !lastname) {
    return `${firstNameInit[0]}`;
  }

  return `${firstNameInit[0]}${lastNameInit[0]}`;
};
