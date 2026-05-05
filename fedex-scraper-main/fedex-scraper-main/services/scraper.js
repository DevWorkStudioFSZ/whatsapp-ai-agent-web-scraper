const axios = require("axios");

const API_URL = "https://www.office.fedex.com/api/products"; 

async function getAllProducts() {
      try {
                const res = await axios.get(API_URL);
                const products = res.data.map(item => ({
                              title: item.name,
                              price: item.price,
                              id: item.id
                }));
                return products;
      } catch (err) {
                console.error("Error fetching products:", err.message);
                return [];
      }
}

async function searchByName(query) {
      const all = await getAllProducts();
      return all.filter(p => 
                                p.title.toLowerCase().includes(query.toLowerCase())
                            );
}

async function searchByPrice(price) {
      const all = await getAllProducts();
      return all.filter(p => parseFloat(p.price) === parseFloat(price));
}

module.exports = {
      getAllProducts,
      searchByName,
      searchByPrice
};
