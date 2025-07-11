export interface Product {
  id: number;
  name: string;
  price: number;
  discount?: number;
  image: string;
  description: string;
  colors?: string[];
  sizes?: string[];
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Nike Air Jordan",
    price: 12000,
    discount: 15,
    image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-jordan-1-mid-shoes-X5pM09.png",
    description: "High quality sports shoes",
    colors: ["red", "blue", "black"],
    sizes: ["38", "39", "40", "41"],
    category: "Footwear",
  },
  {
    id: 2,
    name: "Adidas T-Shirt",
    price: 1500,
    discount: 10,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/62e877e6d6a147cd98e3af8e00fe97f6_9366/Trefoil_Tee_Black_IB3934_01_laydown.jpg",
    description: "Cotton T-Shirt",
    colors: ["white", "gray"],
    sizes: ["S", "M", "L", "XL"],
    category: "Clothing",
  },
];

export const categories = [
  { id: 1, name: "Footwear", icon: "shoe-formal" },
  { id: 2, name: "Clothing", icon: "tshirt-v" },
  { id: 3, name: "Electronics", icon: "laptop" },
];