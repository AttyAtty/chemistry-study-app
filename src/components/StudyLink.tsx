import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string; scroll?: boolean };

// Native fragment navigation preserves the exact URL, including on a revisit.
// Next's cached route canonical URL can already contain a fragment; appending
// another fragment then produces #fields#fields. Non-fragment links stay soft.
export function StudyLink({ href, scroll, ...props }: Props) {
  return href.includes("#") ? <a href={href} {...props} /> : <Link href={href} scroll={scroll} {...props} />;
}
