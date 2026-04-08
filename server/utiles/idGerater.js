import { v4 as uuidv4 } from "uuid";

export const generatePropertyId = (title) => {
  const shortName = (title || "").replace(/\s+/g, "").slice(0, 3).toUpperCase();

  const unique = uuidv4().slice(0, 6);

  return `PROP-${shortName}-${unique}`;
};
