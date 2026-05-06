import { findUserByUsername } from "../../modules/users/user.service.js";


export const generateBaseUsername = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")       // spaces → _
    .replace(/[^a-z0-9_]/g, ""); // remove special chars
};


export const generateUniqueUsername = async (
  name: string
): Promise<string> => {
  const baseUsername = generateBaseUsername(name);

  let username = baseUsername;
  let count = 1;

  while (await findUserByUsername(username)) {
    username = `${baseUsername}_${count}`;
    count++;
  }

  return username;
};