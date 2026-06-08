export type AuthorLink = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  ariaLabel: string;
};

export const authorLinks: AuthorLink[] = [
  {
    label: "Amazon",
    href: "https://www.amazon.com.au/dp/B0F79J4244?ref=cm_sw_r_ffobk_cp_ud_dp_BQ0QZ9PBQY96CFXES096&ref_=cm_sw_r_ffobk_cp_ud_dp_BQ0QZ9PBQY96CFXES096&social_share=cm_sw_r_ffobk_cp_ud_dp_BQ0QZ9PBQY96CFXES096&bestFormat=true&previewDoh=1",
    variant: "primary",
    ariaLabel: "View I Am Your Beast on Amazon"
  },
  {
    label: "Goodreads",
    href: "https://www.goodreads.com/book/show/232581343-i-am-your-beast",
    variant: "secondary",
    ariaLabel: "View I Am Your Beast on Goodreads"
  }
];
