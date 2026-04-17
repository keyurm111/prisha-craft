export interface Product {
  _id: string;
  name: string;
  sku?: string;
  description: string;
  price: number;
  mrp: number;
  category: { _id: string; name: string };
  mainImage: string;
  images?: string[];
  highlights?: string[];
  stock: number;
  video?: string;
  featured?: boolean;
  shippingDimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export const WHATSAPP_NUMBER = "919999999999";

export const categories = [
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    description: "Premium kitchenware and appliances for modern living",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  },
  {
    id: "home-decor",
    name: "Home & Decor",
    description: "Elegant décor pieces to transform your space",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80",
  },
  {
    id: "cleaning",
    name: "Cleaning Products",
    description: "Professional-grade cleaning solutions",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80",
  },
] as const;

export function getWhatsAppLink(productName: string) {
  const message = encodeURIComponent(`Hi, I'm interested in ${productName} from Prisha Crafts`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function getWhatsAppBulkLink() {
  const message = encodeURIComponent("Hi, I'm interested in bulk orders from Prisha Crafts");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
