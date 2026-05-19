import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homesick — Wall",
  description: "A wall of little windows.",
};

/* The root layout sets html/body to overflow-hidden for the film-strip site.
   The wall page scrolls vertically, so we open it up here. */
export default function WallLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-black">
      {children}
    </div>
  );
}
