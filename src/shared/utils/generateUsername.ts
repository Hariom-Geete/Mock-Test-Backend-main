import User from "../../modules/users/user.model.js";

export const generateUsername = async (name: string) => {
  const base = name.toLowerCase().replace(/\s+/g, "");

  let username = base;
  let counter = 0;

  while (true) {
    const existing = await User.findOne({ username });

    if (!existing) return username;

    counter++;
    username = `${base}${counter}`;
  }
};