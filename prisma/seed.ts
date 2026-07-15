import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import process from 'process'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning existing database data...')
  await prisma.notification.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.sitePhoto.deleteMany()
  await prisma.portfolioPhoto.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.message.deleteMany()
  await prisma.webhookEvent.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.project.deleteMany()
  await prisma.vendorProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding data...')

  // Hashes
  const adminHash = bcrypt.hashSync('Admin@123', 10)
  const clientHash = bcrypt.hashSync('Client@123', 10)
  const vendorHash = bcrypt.hashSync('Vendor@123', 10)

  // 1. ADMIN USER
  const admin = await prisma.user.create({
    data: {
      email: 'admin@homeevo.dev',
      passwordHash: adminHash,
      name: 'HomeEvo Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // 2. CLIENT USERS
  const client1 = await prisma.user.create({
    data: {
      email: 'client1@homeevo.dev',
      passwordHash: clientHash,
      name: 'Priya Reddy',
      phone: '9876543210',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@homeevo.dev',
      passwordHash: clientHash,
      name: 'Arjun Varma',
      phone: '9876543211',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })

  const client3 = await prisma.user.create({
    data: {
      email: 'client3@homeevo.dev',
      passwordHash: clientHash,
      name: 'Sunita Rao',
      phone: '9876543212',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })

  const client4 = await prisma.user.create({
    data: {
      email: 'client4@homeevo.dev',
      passwordHash: clientHash,
      name: 'Manish Kumar',
      phone: '9876543213',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })

  const client5 = await prisma.user.create({
    data: {
      email: 'client5@homeevo.dev',
      passwordHash: clientHash,
      name: 'Kavitha Patel',
      phone: '9876543214',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })

  // 3. VENDOR USERS & PROFILES
  // Vendor 1: Raju (Civil)
  const vendor1User = await prisma.user.create({
    data: {
      email: 'vendor1@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Raju',
      phone: '9876543220',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor1Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor1User.id,
      businessName: 'Raju Constructions',
      category: 'Civil Construction',
      description: 'Experienced civil construction contractor specializing in high-quality residential buildings.',
      isVerified: true,
      avgRating: 4.8,
      reviewCount: 38,
      yearsExperience: 10,
      profileCompletion: 90,
      serviceAreas: ['Vijayawada', 'Guntur', 'Amaravati'],
    },
  })

  // Vendor 2: Krishna (Electrical)
  const vendor2User = await prisma.user.create({
    data: {
      email: 'vendor2@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Krishna',
      phone: '9876543221',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor2Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor2User.id,
      businessName: 'Krishna Electricals',
      category: 'Electrical Work',
      description: 'Reliable and safe domestic and commercial electrical contracting services.',
      isVerified: true,
      avgRating: 4.6,
      reviewCount: 22,
      yearsExperience: 6,
      profileCompletion: 80,
      serviceAreas: ['Vijayawada', 'Tenali'],
    },
  })

  // Vendor 3: Lakshmi (Interior)
  const vendor3User = await prisma.user.create({
    data: {
      email: 'vendor3@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Lakshmi',
      phone: '9876543222',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor3Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor3User.id,
      businessName: 'Lakshmi Interiors',
      category: 'Interior Finishing',
      description: 'Creating stunning and functional modular interior designs for modern homes.',
      isVerified: false,
      avgRating: 4.2,
      reviewCount: 8,
      yearsExperience: 4,
      profileCompletion: 75,
      serviceAreas: ['Guntur', 'Amaravati'],
    },
  })

  // Vendor 4: Sridhar (Plumbing)
  const vendor4User = await prisma.user.create({
    data: {
      email: 'vendor4@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Sridhar',
      phone: '9876543223',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor4Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor4User.id,
      businessName: 'Sridhar Plumbing Works',
      category: 'Plumbing & Sanitation',
      description: 'Professional plumbing installations, leakage fixing, and complete sanitation layouts.',
      isVerified: true,
      avgRating: 4.5,
      reviewCount: 17,
      yearsExperience: 8,
      profileCompletion: 85,
      serviceAreas: ['Vijayawada', 'Krishna District'],
    },
  })

  // Vendor 5: Ramesh (Painting)
  const vendor5User = await prisma.user.create({
    data: {
      email: 'vendor5@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Ramesh',
      phone: '9876543224',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor5Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor5User.id,
      businessName: 'Ramesh Painting Services',
      category: 'Painting & Wall Care',
      description: 'Professional painting services including interior, exterior, texture and decorative painting.',
      isVerified: true,
      avgRating: 4.7,
      reviewCount: 19,
      yearsExperience: 5,
      profileCompletion: 80,
      serviceAreas: ['Guntur', 'Tenali'],
    },
  })

  // Vendor 6: Srinivas (Carpentry)
  const vendor6User = await prisma.user.create({
    data: {
      email: 'vendor6@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Srinivas',
      phone: '9876543225',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor6Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor6User.id,
      businessName: 'Srinivas Woodworks',
      category: 'Carpentry & Woodwork',
      description: 'Custom furniture, door frames, kitchen cabinets, and complete residential woodwork solutions.',
      isVerified: true,
      avgRating: 4.9,
      reviewCount: 42,
      yearsExperience: 12,
      profileCompletion: 95,
      serviceAreas: ['Vijayawada', 'Amaravati'],
    },
  })

  // Vendor 7: Anji (Masonry)
  const vendor7User = await prisma.user.create({
    data: {
      email: 'vendor7@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Anji',
      phone: '9876543226',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor7Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor7User.id,
      businessName: 'Anji Masonry Works',
      category: 'Masonry & Bricklaying',
      description: 'Reliable stone, brick, block masonry and plastering solutions for buildings.',
      isVerified: false,
      avgRating: 4.3,
      reviewCount: 11,
      yearsExperience: 7,
      profileCompletion: 70,
      serviceAreas: ['Guntur'],
    },
  })

  // Vendor 8: Satya (Civil Construction)
  const vendor8User = await prisma.user.create({
    data: {
      email: 'vendor8@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Satya',
      phone: '9876543227',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor8Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor8User.id,
      businessName: 'Satya Infra Projects',
      category: 'Civil Construction',
      description: 'Large-scale residential infrastructure, commercial foundation building and project execution.',
      isVerified: true,
      avgRating: 4.8,
      reviewCount: 50,
      yearsExperience: 15,
      profileCompletion: 90,
      serviceAreas: ['Vijayawada', 'Guntur', 'Visakhapatnam'],
    },
  })

  // Vendor 9: Naidu (Electrical)
  const vendor9User = await prisma.user.create({
    data: {
      email: 'vendor9@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Naidu',
      phone: '9876543228',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor9Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor9User.id,
      businessName: 'Naidu Electrical Solutions',
      category: 'Electrical Work',
      description: 'High voltage layouts, household wiring, panel setup, smart home automation integration.',
      isVerified: true,
      avgRating: 4.5,
      reviewCount: 14,
      yearsExperience: 9,
      profileCompletion: 85,
      serviceAreas: ['Amaravati', 'Vijayawada'],
    },
  })

  // Vendor 10: Prasad (Plumbing)
  const vendor10User = await prisma.user.create({
    data: {
      email: 'vendor10@homeevo.dev',
      passwordHash: vendorHash,
      name: 'Prasad',
      phone: '9876543229',
      role: 'VENDOR',
      status: 'ACTIVE',
    },
  })
  const vendor10Profile = await prisma.vendorProfile.create({
    data: {
      userId: vendor10User.id,
      businessName: 'Prasad Plumbers & Fitting',
      category: 'Plumbing & Sanitation',
      description: 'Leak detection, kitchen pipe layouts, bathroom fittings, solar water heater installations.',
      isVerified: true,
      avgRating: 4.6,
      reviewCount: 30,
      yearsExperience: 11,
      profileCompletion: 88,
      serviceAreas: ['Vijayawada', 'Tenali'],
    },
  })

  // 4. PROJECTS AND MILESTONES
  // Project 1: Priya Reddy -> Raju, active
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      vendorId: vendor1User.id,
      title: '3BHK Villa — Moghalrajpuram',
      category: 'Civil Construction',
      description: 'Construction of a premium 3BHK villa with high-quality materials and modern design.',
      location: 'Moghalrajpuram, Vijayawada',
      budget: 1840000,
      status: 'ACTIVE',
    },
  })

  // Milestones for Project 1
  const milestone1_1 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Foundation & Plinth',
      deliverable: 'Excavation, PCC, RCC Footings and Plinth beams complete',
      amount: 400000,
      status: 'RELEASED',
      orderIndex: 0,
      approvedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      approvedById: client1.id,
    },
  })

  const milestone1_2 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Structural Frame',
      deliverable: 'RCC Columns, Beams and Slabs for Ground & First Floor complete',
      amount: 550000,
      status: 'RELEASED',
      orderIndex: 1,
      approvedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 5 weeks ago
      approvedById: client1.id,
    },
  })

  const milestone1_3 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Brick & Plaster',
      deliverable: 'Internal and external brick wall construction and plastering work',
      amount: 450000,
      status: 'PENDING_APPROVAL',
      orderIndex: 2,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    },
  })

  const milestone1_4 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Electrical & Plumbing',
      deliverable: 'Concealed piping, wiring, and sanitation lines installation',
      amount: 250000,
      status: 'UPCOMING',
      orderIndex: 3,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
    },
  })

  const milestone1_5 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Finishing & Handover',
      deliverable: 'Painting, flooring, fixtures fitting, final clean-up, and keys handover',
      amount: 190000,
      status: 'UPCOMING',
      orderIndex: 4,
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    },
  })

  // Project 2: Arjun Varma -> Raju, active
  const project2 = await prisma.project.create({
    data: {
      clientId: client2.id,
      vendorId: vendor1User.id,
      title: 'Office Foundation — Guntur Road',
      category: 'Civil Construction',
      description: 'Laying the foundation and ground structures for a commercial office layout.',
      location: 'Guntur Road, Vijayawada',
      budget: 920000,
      status: 'ACTIVE',
    },
  })

  const milestone2_1 = await prisma.milestone.create({
    data: {
      projectId: project2.id,
      title: 'Site Preparation',
      deliverable: 'Clearing, leveling, and temporary fencing of the project site',
      amount: 150000,
      status: 'RELEASED',
      orderIndex: 0,
      approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      approvedById: client2.id,
    },
  })

  const milestone2_2 = await prisma.milestone.create({
    data: {
      projectId: project2.id,
      title: 'Foundation Work',
      deliverable: 'Excavation and pouring of concrete footings',
      amount: 380000,
      status: 'IN_PROGRESS',
      orderIndex: 1,
    },
  })

  const milestone2_3 = await prisma.milestone.create({
    data: {
      projectId: project2.id,
      title: 'Plinth Beam',
      deliverable: 'Reinforcement and casting of the plinth beams',
      amount: 240000,
      status: 'UPCOMING',
      orderIndex: 2,
    },
  })

  const milestone2_4 = await prisma.milestone.create({
    data: {
      projectId: project2.id,
      title: 'Completion',
      deliverable: 'Final backfilling, clean up, and inspection clearance',
      amount: 150000,
      status: 'UPCOMING',
      orderIndex: 3,
    },
  })

  // Project 3: Sunita Rao -> Null, bidding
  const project3 = await prisma.project.create({
    data: {
      clientId: client3.id,
      vendorId: null,
      title: '2BHK Interior — Krishna Nagar',
      category: 'Interior Finishing',
      description: 'Modular kitchen, TV units, wardrobe designs, and false ceiling for a new 2BHK flat.',
      location: 'Krishna Nagar, Vijayawada',
      budget: 650000,
      status: 'PENDING_BIDS',
    },
  })

  // Bid on Project 3 by Lakshmi
  const bid1 = await prisma.bid.create({
    data: {
      projectId: project3.id,
      vendorId: vendor3User.id,
      totalAmount: 620000,
      timelineWeeks: 10,
      status: 'PENDING',
      message: 'We specialize in premium modular interiors and customize designs to fit your exact style and usage needs. Ready to show our portfolio.',
      milestones: [
        {
          title: 'Design & 3D Modeling',
          amount: 100000,
          deliverable: 'Completed 3D design and material specs selection',
          timelineWeeks: 2,
        },
        {
          title: 'Carpentry & Carcass Production',
          amount: 300000,
          deliverable: 'Carcasses assembled and installed on site',
          timelineWeeks: 5,
        },
        {
          title: 'Lamination & Hardware Fitting',
          amount: 150000,
          deliverable: 'Shutters, drawers, and premium hardware aligned and installed',
          timelineWeeks: 2,
        },
        {
          title: 'Clean-up & Final Handover',
          amount: 70000,
          deliverable: 'Final site cleaning and modular interior handover',
          timelineWeeks: 1,
        },
      ],
    },
  })

  // 5. PAYMENTS FOR RELEASED MILESTONES (Project 1)
  await prisma.payment.create({
    data: {
      projectId: project1.id,
      milestoneId: milestone1_1.id,
      payerId: client1.id,
      payeeId: vendor1User.id,
      amount: 400000,
      type: 'MILESTONE_RELEASE',
      status: 'RELEASED',
      razorpayOrderId: 'order_mock_001',
      razorpayPaymentId: 'pay_mock_001',
    },
  })

  await prisma.payment.create({
    data: {
      projectId: project1.id,
      milestoneId: milestone1_2.id,
      payerId: client1.id,
      payeeId: vendor1User.id,
      amount: 550000,
      type: 'MILESTONE_RELEASE',
      status: 'RELEASED',
      razorpayOrderId: 'order_mock_002',
      razorpayPaymentId: 'pay_mock_002',
    },
  })

  // 6. REVIEWS
  await prisma.review.create({
    data: {
      projectId: project1.id,
      reviewerId: client1.id,
      vendorId: vendor1User.id,
      vendorProfileId: vendor1Profile.id,
      rating: 5,
      comment: "Raju's team is exceptional — punctual, quality masonry, transparent on costs.",
    },
  })

  await prisma.review.create({
    data: {
      projectId: project2.id,
      reviewerId: client2.id,
      vendorId: vendor1User.id,
      vendorProfileId: vendor1Profile.id,
      rating: 4,
      comment: 'Good work overall, slight delay on roofing but explained well. Clean site.',
    },
  })

  // 7. SAMPLE PRODUCTS
  await prisma.product.createMany({
    data: [
      // Cement
      { name: 'OPC 53 Grade Cement (ACC)', category: 'Cement', description: 'Premium grade Ordinary Portland Cement for high strength concrete works.', price: 420, unit: 'bag', stock: 500 },
      { name: 'PPC Cement (Ultratech)', category: 'Cement', description: 'Portland Pozzolana Cement ideal for plastering and brick masonry.', price: 395, unit: 'bag', stock: 350 },
      // Steel
      { name: 'TMT Steel Bars 8mm (JSPL)', category: 'Steel', description: 'Thermo-Mechanically Treated reinforcement steel bars for slabs and framing.', price: 68, unit: 'kg', stock: 2000 },
      { name: 'TMT Steel Bars 12mm (JSPL)', category: 'Steel', description: 'Thermo-Mechanically Treated reinforcement steel bars for load-bearing pillars.', price: 66, unit: 'kg', stock: 1800 },
      // Tiles
      { name: 'Vitrified Floor Tiles 600x600mm', category: 'Tiles', description: 'High-gloss vitrified tiles for premium bedroom and living area floors.', price: 55, unit: 'sq_ft', stock: 3000 },
      { name: 'Wall Tiles 300x450mm (Johnson)', category: 'Tiles', description: 'Durable glazed ceramic wall tiles for kitchens and bathrooms.', price: 38, unit: 'sq_ft', stock: 2500 },
      { name: 'Anti-skid Bathroom Tiles', category: 'Tiles', description: 'Matte finish textured ceramic tiles preventing slips in wet areas.', price: 42, unit: 'sq_ft', stock: 1200 },
      // Plumbing
      { name: 'CPVC Pipes 1/2 inch (Astral)', category: 'Plumbing', description: 'Chlorinated Polyvinyl Chloride pipes for hot and cold water distribution.', price: 120, unit: 'piece', stock: 400 },
      { name: 'PVC Ball Valve 25mm', category: 'Plumbing', description: 'Threaded socket PVC ball valve for controlling water lines flow.', price: 85, unit: 'piece', stock: 200 },
      { name: 'CP Brass Tap (Jaquar)', category: 'Plumbing', description: 'Chrome plated solid brass bib tap for washbasin and bathroom utility.', price: 1450, unit: 'piece', stock: 80 },
    ],
  })

  // 8. NOTIFICATIONS FOR PRIYA REDDY
  await prisma.notification.create({
    data: {
      userId: client1.id,
      type: 'MILESTONE_APPROVED',
      title: 'Milestone Released',
      message: '₹5,50,000 released for Structural Frame completion',
      isRead: false,
      metadata: { projectId: project1.id, milestoneId: milestone1_2.id },
    },
  })

  await prisma.notification.create({
    data: {
      userId: client1.id,
      type: 'MILESTONE_PENDING',
      title: 'Milestone Awaiting Approval',
      message: 'Raju Constructions has requested approval for Brick & Plaster',
      isRead: false,
      metadata: { projectId: project1.id, milestoneId: milestone1_3.id },
    },
  })

  await prisma.notification.create({
    data: {
      userId: client1.id,
      type: 'BID_RECEIVED',
      title: 'New Bid on Your Project',
      message: 'Lakshmi Interiors submitted a bid of ₹6,20,000 for your interior project',
      isRead: false,
      metadata: { projectId: project3.id, bidId: bid1.id },
    },
  })

  console.log('✅ HomeEvo DB seeded successfully')
  console.log('   👤 Users: 1 admin, 5 clients, 10 vendors')
  console.log('   🏗️ Projects: 3 (2 active, 1 pending bids)')
  console.log('   🧱 Milestones: 9 total')
  console.log('   💰 Payments: 2 released')
  console.log('   ⭐ Reviews: 2')
  console.log('   📦 Products: 10')
  console.log('   🔔 Notifications: 3')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
