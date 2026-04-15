import { verifyRoom, unauthorized } from '@/lib/server-auth'

export async function GET(request, { params }) {
  const room = await verifyRoom(request, params.token)
  if (!room) return unauthorized('Room not found or inactive')

  return Response.json({
    categories: [
      { id: 'breakfast', name: 'Breakfast', items: [
        { id: 'b1', name: 'Masala Dosa', price: 120, description: 'Crispy dosa with spiced potato filling' },
        { id: 'b2', name: 'Idli Sambar (3 pcs)', price: 90, description: 'Steamed rice cakes with sambar and chutney' },
        { id: 'b3', name: 'Poha', price: 80, description: 'Flattened rice with vegetables and spices' },
        { id: 'b4', name: 'Continental Breakfast', price: 250, description: 'Toast, eggs, juice, and coffee' },
        { id: 'b5', name: 'Omelette (2 eggs)', price: 100, description: 'Masala or plain' },
      ]},
      { id: 'lunch', name: 'Lunch', items: [
        { id: 'l1', name: 'Veg Thali', price: 200, description: 'Rice, dal, 2 sabzi, roti, pickle, papad' },
        { id: 'l2', name: 'Non-Veg Thali', price: 280, description: 'Rice, dal, chicken curry, roti, pickle' },
        { id: 'l3', name: 'Curd Rice', price: 100, description: 'Tempered curd rice with pickle' },
        { id: 'l4', name: 'Pulao', price: 150, description: 'Vegetable pulao with raita' },
      ]},
      { id: 'dinner', name: 'Dinner', items: [
        { id: 'd1', name: 'Veg Biryani', price: 220, description: 'Aromatic basmati rice with vegetables' },
        { id: 'd2', name: 'Chicken Biryani', price: 320, description: 'Aromatic basmati rice with tender chicken' },
        { id: 'd3', name: 'Paneer Butter Masala + Roti (3)', price: 240, description: 'Rich tomato-based paneer gravy' },
        { id: 'd4', name: 'Dal Makhani + Roti (3)', price: 180, description: 'Slow-cooked black lentils' },
        { id: 'd5', name: 'Chicken Curry + Rice', price: 280, description: 'Spicy home-style chicken curry' },
      ]},
      { id: 'snacks', name: 'Snacks', items: [
        { id: 's1', name: 'Samosa (2 pcs)', price: 60, description: 'Crispy pastry with spiced potato filling' },
        { id: 's2', name: 'Spring Roll (2 pcs)', price: 80, description: 'Crispy vegetable spring rolls' },
        { id: 's3', name: 'Vada Pav', price: 60, description: 'Mumbai-style potato fritter in a bun' },
        { id: 's4', name: 'French Fries', price: 100, description: 'Salted or masala fries' },
      ]},
      { id: 'beverages', name: 'Beverages', items: [
        { id: 'bv1', name: 'Filter Coffee', price: 50, description: 'South Indian filter coffee' },
        { id: 'bv2', name: 'Masala Chai', price: 40, description: 'Spiced milk tea' },
        { id: 'bv3', name: 'Fresh Lime Soda', price: 70, description: 'Sweet, salted, or plain' },
        { id: 'bv4', name: 'Fresh Fruit Juice', price: 100, description: 'Orange, Mosambi, or Watermelon' },
        { id: 'bv5', name: 'Mineral Water (1L)', price: 30 },
        { id: 'bv6', name: 'Cold Coffee', price: 120, description: 'Blended cold coffee with milk' },
      ]},
      { id: 'minibar', name: 'Minibar', items: [
        { id: 'm1', name: 'Coca Cola (330ml)', price: 60 },
        { id: 'm2', name: 'Sprite (330ml)', price: 60 },
        { id: 'm3', name: 'Bisleri Water (500ml)', price: 25 },
        { id: 'm4', name: 'Lays Chips', price: 30 },
        { id: 'm5', name: 'KitKat', price: 50 },
      ]},
    ],
  })
}
