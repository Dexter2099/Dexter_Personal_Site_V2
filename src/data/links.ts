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
    href: "mailto:dexter.mehta01@gmail.com",
    variant: "secondary",
    ariaLabel: "Email Dexter Mehta"
  }
];

export const contactEmailHref = socialLinks.find(link => link.label === "Email")!.href;
