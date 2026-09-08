export interface NavItem {
  id: string
  label: string
}

/**
 * Section ids match the `id` attributes rendered on each <section>.
 * "testimonials" was removed — that section is disabled on the page.
 */
export const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'works', label: 'Work' },
  { id: 'timeline', label: 'Experience' },
  { id: 'security', label: 'Approach' },
  { id: 'contact', label: 'Contact' },
]
