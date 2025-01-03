import axios from "axios";

const PRODUCTS_API_URL = "https://dummyjson.com/products";

export const fetchData = async ({ limit, skip }) => {
  try {
    const response = await axios.get(PRODUCTS_API_URL, {
      params: { limit: limit, skip: skip },
    });

    return {
      rows: response.data.products,
      rowCount: response.data.total,
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};
