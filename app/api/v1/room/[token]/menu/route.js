import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  return Response.json({
    categories: [
      {
        id: 'gravies',
        name: 'Gravies & Dry Veg',
        items: [
          { id: 'g1', name: 'Paneer Butter Masala', price: 150, description: 'Rich, creamy tomato-based paneer curry' },
          { id: 'g2', name: 'Dal Tadka',            price: 80,  description: 'Yellow lentils tempered with spices' },
          { id: 'g3', name: 'Dal Fry',              price: 80,  description: 'Slow-cooked lentils with a smoky finish' },
          { id: 'g4', name: 'Aloo Gobi',            price: 80,  description: 'Potato and cauliflower stir-fried with spices' },
          { id: 'g5', name: 'Bhindi Masala',        price: 80,  description: 'Okra cooked with onions and spices' },
          { id: 'g6', name: 'Mix Veg Curry',        price: 80,  description: 'Seasonal vegetables in a spiced gravy' },
        ],
      },
      {
        id: 'rice',
        name: 'Rice Dishes',
        items: [
          { id: 'r1', name: 'Jeera Rice',   price: 80,  description: 'Steamed basmati rice tempered with cumin' },
          { id: 'r2', name: 'Veg Pulao',    price: 150, description: 'Aromatic rice cooked with mixed vegetables' },
          { id: 'r3', name: 'Lemon Rice',   price: 70,  description: 'Tangy rice with lemon, mustard, and curry leaves' },
          { id: 'r4', name: 'Curd Rice',    price: 80,  description: 'Cooling tempered curd rice with pickle' },
          { id: 'r5', name: 'Fried Rice',   price: 120, description: 'Wok-tossed vegetable fried rice' },
          { id: 'r6', name: 'Steam Rice',   price: 60,  description: 'Plain steamed rice' },
          { id: 'r7', name: 'Tomato Rice',  price: 90,  description: 'Tangy rice cooked with fresh tomatoes and spices' },
        ],
      },
      {
        id: 'breads',
        name: 'Indian Breads',
        items: [
          { id: 'br1', name: 'Roti / Chapati', price: 15, description: 'Soft whole wheat flatbread' },
          { id: 'br2', name: 'Plain Paratha',  price: 20, description: 'Layered whole wheat flatbread' },
          { id: 'br3', name: 'Poori (2 pcs)',  price: 30, description: 'Deep-fried puffed wheat bread' },
          { id: 'br4', name: 'Phulka',         price: 15, description: 'Thin, light whole wheat flatbread' },
        ],
      },
      {
        id: 'snacks',
        name: 'Snacks',
        items: [
          { id: 's1', name: 'French Fries',     price: 70,  description: 'Crispy golden fries, salted or masala' },
          { id: 's2', name: 'Onion Pakoda',      price: 50,  description: 'Crispy onion fritters with chutneys' },
          { id: 's3', name: 'Paneer Pakoda',     price: 100, description: 'Golden fried paneer with spiced batter' },
          { id: 's4', name: 'Maggi',             price: 50,  description: 'Classic Maggi noodles' },
          { id: 's5', name: 'Veg Sandwich',      price: 60,  description: 'Grilled sandwich with fresh vegetables' },
          { id: 's6', name: 'Paneer Sandwich',   price: 100, description: 'Grilled sandwich with spiced paneer filling' },
          { id: 's7', name: 'Egg Sandwich',      price: 70,  description: 'Grilled sandwich with egg and seasoning' },
          { id: 's8', name: 'Aloo Sandwich',     price: 50,  description: 'Grilled sandwich with spiced potato filling' },
        ],
      },
      {
        id: 'combo',
        name: 'Combos',
        items: [
          { id: 'c1', name: 'Vegetarian Thali',    price: 200, description: 'Roti (4 pcs), Rice, 1 Dry Veg, 1 Veg Curry — Lunch / Dinner' },
          { id: 'c2', name: 'Plain Paratha Combo',  price: 50,  description: '1 Plain Paratha served with curd' },
          { id: 'c3', name: 'Aloo Paratha Combo',   price: 60,  description: '1 Aloo Paratha served with curd' },
          { id: 'c4', name: 'Gobi Paratha Combo',   price: 65,  description: '1 Gobi Paratha served with curd' },
          { id: 'c5', name: 'Onion Paratha Combo',  price: 75,  description: '1 Onion Paratha served with curd' },
          { id: 'c6', name: 'Methi Paratha Combo',  price: 85,  description: '1 Methi Paratha served with curd' },
          { id: 'c7', name: 'Paneer Paratha Combo', price: 95,  description: '1 Paneer Paratha served with curd' },
          { id: 'c8', name: 'Puri & Sabji',         price: 125, description: '4 Puris with Aloo Sabji' },
        ],
      },
      {
        id: 'drinks',
        name: 'Drinks',
        items: [
          { id: 'd1', name: 'Butter Milk',   price: 20, description: 'Chilled spiced buttermilk' },
          { id: 'd2', name: 'Sweet Lassi',   price: 40, description: 'Thick chilled sweet yoghurt drink' },
          { id: 'd3', name: 'Lemon Juice',   price: 20, description: 'Fresh squeezed lemon with sugar and salt' },
          { id: 'd4', name: 'Tea',           price: 30, description: 'Hot masala or plain tea' },
          { id: 'd5', name: 'Coffee',        price: 30, description: 'Hot filter or instant coffee' },
        ],
      },
    ],
  })
}
