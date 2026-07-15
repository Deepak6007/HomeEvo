import { test, expect } from '@playwright/test'

test.describe('Authentication & Project Lifecycle E2E Flow', () => {
  test('should login as client, navigate to projects, and create a new construction project', async ({ page }) => {
    // 1. Visit Signin Page
    await page.goto('/signin')

    // 2. Select homeowner role (default is client, but click to be sure)
    const homeownerPill = page.getByRole('button', { name: 'Homeowner' })
    await expect(homeownerPill).toBeVisible()
    await homeownerPill.click()

    // 3. Fill details and Sign In
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')

    // 4. Verify redirected to client dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)

    // 5. Navigate to Projects page
    await page.goto('/client/projects')
    await expect(page).toHaveURL(/.*\/client\/projects/)

    // 6. Click + New Project button to open Create Project Modal
    const newProjectBtn = page.getByRole('button', { name: '+ New Project' })
    await expect(newProjectBtn).toBeVisible()
    await newProjectBtn.click()

    // --- Step 1: Details ---
    await expect(page.getByText('Construct Your Idea')).toBeVisible()
    await page.fill('input[placeholder="e.g. 3BHK Duplex in Vizag"]', 'Sustainable Beach Villa')
    
    // Select category "Villa Construction"
    await page.click('button:has-text("Select service category")')
    await page.click('role=option[name="Villa Construction"]')

    // Description & Location
    await page.fill('textarea[placeholder*="renovation requirements"]', 'Building a high quality, 3BHK villa with solar energy panels, modular kitchen, and rainwater harvesting setup.')
    await page.fill('input[placeholder="e.g. Madhurawada, Visakhapatnam"]', 'Rushikonda, Visakhapatnam')
    
    // Click Next
    await page.click('button:has-text("Next")')

    // --- Step 2: Budget & Timeline ---
    await page.fill('input[placeholder="e.g. 1500000"]', '12500000') // ₹1.25 Crore
    
    // Set desired start date (must be today or future - let's set future date)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 10)
    const dateString = futureDate.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateString)

    await page.fill('input[placeholder="e.g. 6 months"]', '9 months')
    
    // Click Next
    await page.click('button:has-text("Next")')

    // --- Step 3: Uploader (Optional) ---
    // Since images are optional, we proceed to submit directly
    const createBtn = page.getByRole('button', { name: 'Create Project' })
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // 7. Verify project was created and redirected to project details
    await expect(page).toHaveURL(/.*\/client\/projects\/project-\d+/)
    
    // Verify details on the new project page
    await expect(page.locator('h1, h2, h3')).toContainText('Sustainable Beach Villa')
  })
})
