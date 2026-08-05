import type { FaqItem } from "./types";

const FAQS: FaqItem[] = [
  {
    id: "1",
    question: "What areas in Vadodara do you deliver to?",
    answer:
      "We currently deliver across Vadodara including Alkapuri, Gotri, Sayajigunj, Karelibaug, Manjalpur, and Old Padra Road. Contact us to confirm delivery to your specific area.",
  },
  {
    id: "2",
    question: "How does same-day delivery work?",
    answer:
      "Place your order before 4 PM and we'll deliver it the same day, anywhere in our service area.",
  },
  {
    id: "3",
    question: "Can I schedule a midnight delivery?",
    answer:
      "Yes — select the Midnight Delivery option at checkout to have your order delivered at 12 AM sharp.",
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer: "We accept UPI, all major cards, and cash on delivery, powered securely by Razorpay.",
  },
  {
    id: "5",
    question: "Can I add a message card to my order?",
    answer: "Yes — every order includes a free personalized message card at checkout.",
  },
];

export async function getFaqs(): Promise<FaqItem[]> {
  return FAQS;
}
