import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homesick — Grid",
  description: "A grid of little windows. Pick one.",
};

/* The root layout sets html/body to overflow-hidden for the film-strip site.
   The grid page scrolls vertically, so we open it up here. */
export default function GridLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-black">
      {children}
    </div>
  );
}
