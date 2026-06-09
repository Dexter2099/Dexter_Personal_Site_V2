export type NavItem = {
  label: string;
  href: string;
  icon: "home" | "briefcase" | "folder" | "user" | "mail";
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Experience", href: "/experience/", icon: "briefcase" },
  { label: "Projects", href: "/projects/", icon: "folder" },
  { label: "About", href: "/about/", icon: "user" },
  { label: "Contact", href: "/contact/", icon: "mail" }
];
