import { http, HttpResponse } from 'msw'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Simple in-memory storage for test project state
const mockProjects = [
  {
    id: 'project-1',
    title: 'Modern Villa Renovations',
    description: 'Renovating 3BHK villa with green infrastructure.',
    status: 'in_progress',
    budget: 850000,
    clientId: 'user-1',
    vendorId: 'vendor-1' as string | null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      { id: 'm1', title: 'Site excavation', status: 'released', amount: 150000, date: '2026-06-15' },
      { id: 'm2', title: 'Foundation setup', status: 'in_progress', amount: 300000, date: '2026-07-20' },
      { id: 'm3', title: 'Finishing & Handover', status: 'upcoming', amount: 400000, date: '2026-09-01' }
    ]
  }
]

export const handlers = [
  // Sign In Handler
  http.post(`${baseURL}/auth/signin`, async ({ request }) => {
    const body = (await request.json()) as any
    if (body.email === 'invalid@example.com') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-1',
          email: body.email || 'client@example.com',
          name: 'John Client',
          role: body.role || 'client',
        },
      },
      message: 'Signed in successfully',
    })
  }),

  // Sign Up Handler
  http.post(`${baseURL}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-2',
          email: body.email,
          name: body.name,
          role: body.role || 'client',
        },
      },
      message: 'Registered successfully',
    })
  }),

  // Sign Out Handler
  http.post(`${baseURL}/auth/signout`, () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Signed out successfully',
    })
  }),

  // Refresh Token Handler
  http.post(`${baseURL}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as any
    if (body.refreshToken === 'expired-refresh-token' || !body.refreshToken) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: 'Refresh token expired or missing',
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      },
      message: 'Token refreshed successfully',
    })
  }),

  // Fetch Current User
  http.get(`${baseURL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'user-1',
        email: 'client@example.com',
        name: 'John Client',
        role: 'client',
      },
      message: 'User profile retrieved',
    })
  }),

  // List Projects
  http.get(`${baseURL}/projects`, () => {
    return HttpResponse.json({
      success: true,
      data: mockProjects,
      message: 'Projects retrieved successfully',
      pagination: { page: 1, pageSize: 10, total: mockProjects.length, totalPages: 1 },
    })
  }),

  // Create Project
  http.post(`${baseURL}/projects`, async ({ request }) => {
    const body = (await request.json()) as any
    const newProject = {
      id: `project-${Date.now()}`,
      title: body.title,
      description: body.description,
      status: 'upcoming',
      budget: body.budget || 500000,
      clientId: 'user-1',
      vendorId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: body.milestones || []
    }
    mockProjects.push(newProject)
    return HttpResponse.json({
      success: true,
      data: newProject,
      message: 'Project created successfully',
    })
  }),

  // Get Single Project
  http.get(`${baseURL}/projects/:id`, ({ params }) => {
    const project = mockProjects.find((p) => p.id === params.id)
    if (!project) {
      return HttpResponse.json(
        { success: false, data: null, message: 'Project not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: project,
      message: 'Project retrieved successfully',
    })
  }),
]
