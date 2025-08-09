import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users with new unified system
  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    update: {},
    create: {
      email: 'seller1@example.com',
      name: 'John Luxury Dealer',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password
      role: 'USER',
      accountType: 'COMPANY',
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    update: {},
    create: {
      email: 'seller2@example.com',
      name: 'Jane Collector',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password
      role: 'USER',
      accountType: 'INDIVIDUAL',
    },
  })

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@example.com' },
    update: {},
    create: {
      email: 'buyer1@example.com',
      name: 'Bob Enthusiast',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password
      role: 'USER',
      accountType: 'INDIVIDUAL',
    },
  })

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@example.com' },
    update: {},
    create: {
      email: 'buyer2@example.com',
      name: 'Alice Investment Co',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password
      role: 'USER',
      accountType: 'COMPANY',
    },
  })

  // Create test listings
  const listing1 = await prisma.listing.upsert({
    where: { id: 'listing-1' },
    update: {},
    create: {
      id: 'listing-1',
      title: 'Rolex Submariner Date',
      description: 'Beautiful Rolex Submariner Date in excellent condition. Includes original box and papers.',
      category: 'WATCH',
      brand: 'Rolex',
      model: 'Submariner Date',
      year: 2020,
      condition: 'EXCELLENT',
      askingPrice: 12000,
      images: ['/uploads/rolex-1.jpg', '/uploads/rolex-2.jpg'],
      status: 'ACTIVE',
      sellerId: seller1.id,
    },
  })

  const listing2 = await prisma.listing.upsert({
    where: { id: 'listing-2' },
    update: {},
    create: {
      id: 'listing-2',
      title: 'Hermès Birkin Bag',
      description: 'Authentic Hermès Birkin bag in black leather. Perfect condition.',
      category: 'BAG',
      brand: 'Hermès',
      model: 'Birkin',
      year: 2019,
      condition: 'EXCELLENT',
      askingPrice: 15000,
      images: ['/uploads/hermes-1.jpg', '/uploads/hermes-2.jpg'],
      status: 'ACTIVE',
      sellerId: seller2.id,
    },
  })

  const listing3 = await prisma.listing.upsert({
    where: { id: 'listing-3' },
    update: {},
    create: {
      id: 'listing-3',
      title: 'Cartier Love Bracelet',
      description: '18k gold Cartier Love bracelet with diamonds. Includes screwdriver.',
      category: 'JEWELRY',
      brand: 'Cartier',
      model: 'Love Bracelet',
      year: 2021,
      condition: 'NEW',
      askingPrice: 8000,
      images: ['/uploads/cartier-1.jpg'],
      status: 'ACTIVE',
      sellerId: seller1.id,
    },
  })

  // Create test offers
  await prisma.offer.upsert({
    where: { id: 'offer-1' },
    update: {},
    create: {
      id: 'offer-1',
      amount: 11500,
      message: 'I am very interested in this watch. Would you consider this offer?',
      status: 'PENDING',
      buyerId: buyer1.id,
      listingId: listing1.id,
    },
  })

  await prisma.offer.upsert({
    where: { id: 'offer-2' },
    update: {},
    create: {
      id: 'offer-2',
      amount: 14000,
      message: 'Beautiful bag! I would love to add this to my collection.',
      status: 'PENDING',
      buyerId: buyer2.id,
      listingId: listing2.id,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
