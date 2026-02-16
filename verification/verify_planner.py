from playwright.sync_api import Page, expect, sync_playwright
import time

def test_planner(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:8081")

    # 2. Act: Navigate to Planner.
    # Handle "Continue as Guest" if it appears.
    try:
        # Wait a bit for initial render
        page.wait_for_timeout(2000)
        guest_btn = page.get_by_text("Continue as Guest")
        if guest_btn.is_visible():
            guest_btn.click()
            page.wait_for_timeout(2000) # Wait for navigation
    except:
        pass

    # Wait for tab bar.
    planner_tab = page.get_by_text("Planner").last
    planner_tab.wait_for(state="visible")
    planner_tab.click()

    page.wait_for_timeout(1000)

    # Create a new semester if empty.
    # Check if "No Semesters Planned" is visible.
    try:
        no_plans = page.get_by_text("No Semesters Planned")
        if no_plans.is_visible(timeout=3000):
            print("Adding new semester...")
            add_btn = page.get_by_role("button", name="Add new semester")
            add_btn.click()
            # Select Fall 2024
            fall_btn = page.get_by_text("Fall").first
            fall_btn.wait_for(state="visible")
            fall_btn.click()
            page.wait_for_timeout(1000)
    except Exception as e:
        print(f"Adding semester failed or skipped: {e}")
        pass

    # 3. Assert: Check if "Add Course" is visible.
    # We look for the "Add Course" button which is part of the SemesterCard.
    expect(page.get_by_role("button", name="Add course").first).to_be_visible()

    # 4. Screenshot
    page.screenshot(path="verification/planner.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_planner(page)
        finally:
            browser.close()
