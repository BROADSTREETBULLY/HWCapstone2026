const { parseSpecText } = require("../src/services/specTextParser");

describe("parseSpecText (unit)", () => {
  test("parses a full client-style spec into key/value attributes", () => {
    const input = `Product: Custom Filestor Universal Shelving with adjustable shelves
Size: D600 x W1200 x H850mm
Finish: Laminate, white
Misc: To store blue tubs at a size of W360 x D520 x H300mm, consumables, parts, etc
Installation: Under bench`;

    const result = parseSpecText(input);
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      key: "Product",
      value: "Custom Filestor Universal Shelving with adjustable shelves",
      sortOrder: 1,
    });
    expect(result.map((a) => a.key)).toEqual([
      "Product",
      "Size",
      "Finish",
      "Misc",
      "Installation",
    ]);
    expect(result[3].value).toMatch(/blue tubs/);
  });

  test("continues multi-line values onto the previous key", () => {
    const result = parseSpecText("Finish: Laminate,\nwhite gloss\nSize: 600mm");
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe("Laminate, white gloss");
  });

  test("treats keyless text as a Description attribute", () => {
    const result = parseSpecText("Just a plain description of a chair");
    expect(result).toEqual([
      { key: "Description", value: "Just a plain description of a chair", sortOrder: 1 },
    ]);
  });

  test("only splits on the first colon so values can contain colons", () => {
    const result = parseSpecText("Note: install at ratio 1:20 as per drawing");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("Note");
    expect(result[0].value).toBe("install at ratio 1:20 as per drawing");
  });

  test("does not treat long sentences before a colon as keys", () => {
    const result = parseSpecText(
      "Supply and install to all wet areas including the following: tiles",
    );
    expect(result[0].key).toBe("Description");
  });

  test("ignores blank lines", () => {
    const result = parseSpecText("Finish: White\n\n\nSize: 600mm");
    expect(result).toHaveLength(2);
  });

  test("handles empty, null and non-string input", () => {
    expect(parseSpecText("")).toEqual([]);
    expect(parseSpecText(null)).toEqual([]);
    expect(parseSpecText(undefined)).toEqual([]);
    expect(parseSpecText(42)).toEqual([]);
  });

  test("assigns sequential sortOrder", () => {
    const result = parseSpecText("A: 1\nB: 2\nC: 3");
    expect(result.map((a) => a.sortOrder)).toEqual([1, 2, 3]);
  });
});
