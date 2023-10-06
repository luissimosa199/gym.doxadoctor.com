import formatDateString from "./formatDateString";

describe("formatDateString", () => {
  it("debería formatear la fecha correctamente", () => {
    const date = "2023-01-01T00:00:00.000Z";
    const result = formatDateString(date);
    expect(result).toBe("1 de enero de 2023, 00:00");
  });
});
