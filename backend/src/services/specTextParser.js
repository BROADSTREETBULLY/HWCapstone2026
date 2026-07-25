//parses free-text spec input into key/value attributes
//a line like "Finish: Laminate, white" becomes { key: "Finish", value: "Laminate, white" }
//lines that don't start a new "Key:" continue the previous value (multi-line values)
//rawText is always stored verbatim as well - parsing never loses anything

//a key is the text before the FIRST colon on a line, if it looks like a label:
//reasonably short and not itself containing sentence text
const KEY_MAX_LENGTH = 30;

const parseSpecText = (rawText) => {
  if (!rawText || typeof rawText !== "string") return [];

  const attributes = [];
  const lines = rawText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(":");
    const possibleKey = colonIndex > 0 ? trimmed.slice(0, colonIndex).trim() : null;

    const isNewAttribute =
      possibleKey &&
      possibleKey.length <= KEY_MAX_LENGTH &&
      !possibleKey.includes(",") &&
      /^[A-Za-z][A-Za-z0-9 \-/&()]*$/.test(possibleKey);

    if (isNewAttribute) {
      attributes.push({
        key: possibleKey,
        value: trimmed.slice(colonIndex + 1).trim(),
        sortOrder: attributes.length + 1,
      });
    } else if (attributes.length > 0) {
      //continuation of the previous value
      attributes[attributes.length - 1].value += " " + trimmed;
    } else {
      //text before any key appears - treat as an untitled description
      attributes.push({ key: "Description", value: trimmed, sortOrder: 1 });
    }
  }

  return attributes;
};

module.exports = { parseSpecText };
