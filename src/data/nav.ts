export type NavItem = {
  label: string;
  href: string;
  icon: "home" | "briefcase" | "building" | "folder" | "user" | "mail";
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Experience", href: "/experience/", icon: "briefcase" },
  { label: "Professional", href: "/professional/", icon: "building" },
  { label: "Personal", href: "/projects/", icon: "folder" },
  { label: "About", href: "/about/", icon: "user" },
  { label: "Contact", href: "/contact/", icon: "mail" }
];
