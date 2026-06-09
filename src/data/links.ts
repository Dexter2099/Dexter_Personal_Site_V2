export type SocialLink = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  ariaLabel: string;
};

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/Dexter2099",
    variant: "primary",
    ariaLabel: "Visit Dexter Mehta on GitHub"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dexter-developer/",
    variant: "secondary",
    ariaLabel: "Visit Dexter Mehta on LinkedIn"
  },
  {
    label: "Email",
    // TODO: Replace with Dexter's final portfolio contact email address.
    href: "mailto:dexter@example.com",
    variant: "secondary",
    ariaLabel: "Email Dexter Mehta"
  }
];
