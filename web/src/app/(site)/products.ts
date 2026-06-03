export const PRODUCTS = [
  {
    slug: "please-hold",
    name: "PLEASE HOLD",
    image: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
    description:
      "This phone holds one message at a time. Play the game of telephone with friends! Messages save to a digital map so you can co-create funny stories.",
  },
  {
    slug: "wandr",
    name: "WANDR",
    image: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
    description:
      "A stone that counts every mile you've ever walked. Not steps today — miles, total, forever. Watch the number build and suddenly a Tuesday afternoon walk matters.",
  },
  {
    slug: "sigh",
    name: "SIGH",
    image: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
    description:
      "Breathwork guidance shrunk down to light and vibration in your pocket. It's a little ridiculous that the best way to calm down involves pulling out the same device that stresses us out!",
  },
  {
    slug: "parrot",
    name: "PARROT",
    image: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
    description:
      "A robot parrot for your desk. It listens. It repeats things. It has opinions about your vocabulary. Wouldn't it be fun if we all had a parrot? I've always wanted one...",
  },
  {
    slug: "stonecharge",
    name: "STONECHARGE",
    image: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
    description:
      "Safe underneath a beautiful rock that hides your phone. You want it back? Lift the stone. Deliberately. Elevate your space.",
  },
  {
    slug: "dreamcatcher",
    name: "DREAMCATCHER",
    image: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
    description:
      "Press this button in the dark to record your dreams. Receive them transcribed in the morning. If you're feeling brave, we'll analyze them too.",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];

export const STORY = [
  {
    id: "made-invisible",
    title: "MADE INVISIBLE",
    text: "We struggled and struggled to make everything work! Then we made it beautiful. Then we perfected it until it was in every blue jean pocket, so polished and universal it became invisible, which is the worst thing a beautiful thing can become.",
  },
  {
    id: "what-you-lose",
    title: "WHAT YOU LOSE",
    text: "You cannot love what you cannot lose. But nothing broke for so long that you forgot. We track our sleep on the device that ruined it! Everything is efficient and nothing is yours and the distance between yourself and the world has never been wider.",
  },
  {
    id: "not-for-you",
    title: "NOT FOR YOU",
    text: "Our objects are irregular. You might hate one. Good. It wasn't for you. A summer day is comfortable for you but makes me hot and annoyed and hungrier than usual.",
  },
  {
    id: "alive-and-shy",
    title: "ALIVE AND SHY",
    text: "Freed from the tyranny of multi-function, objects can look like themselves again. Your nerve endings know. Magic is the goal. Soon you will hold something alive and shy like a firefly.",
  },
  {
    id: "after-it-works",
    title: "AFTER IT WORKS",
    text: "This is a story about what happens after everything works. Do you, like us, suspect that perfection might be the problem?",
  },
] as const;
