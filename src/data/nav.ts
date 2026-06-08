export type NavItem = {
  label: string;
  href: string;
  iconLabel: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", iconLabel: "H" },
  { label: "Experience", href: "/experience/", iconLabel: "E" },
  { label: "Projects", href: "/projects/", iconLabel: "P" },
  { label: "About", href: "/about/", iconLabel: "A" },
  { label: "Contact", href: "/contact/", iconLabel: "C" }
];
