import { fetchCategories } from './getCategories'; // adjust the import path
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe("fetchCategories", () => {
  const url = '/api/getCategories';

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should fetch categories successfully", async () => {
    const mockCategories = ["category1", "category2"];
    fetchMock.mockOnce(JSON.stringify(mockCategories));

    const response = await fetchCategories();

    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url);
    expect(response).toEqual(mockCategories);
  });

  it("should throw an error if response is not ok", async () => {
    fetchMock.mockOnce(JSON.stringify({}), { status: 500 });

    await expect(fetchCategories()).rejects.toThrow("Failed to fetch categories");

    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(url);
  });
});
