import { Star, Users, Calendar, Gift, Instagram, Mail } from "lucide-react";

export const availableTasks = [
  {
    id: "google_review",
    label: "Google Review",
    icon: <Star className="w-5 h-5" />,
    description: "Boost your SEO and local ranking.",
  },
  {
    id: "referral",
    label: "Referral Program",
    icon: <Users className="w-5 h-5" />,
    description: "Get customers to bring their friends.",
  },
  {
    id: "recurring",
    label: "Recurring Visits",
    icon: <Calendar className="w-5 h-5" />,
    description: "Reward loyalty for every 5th visit.",
  },
  {
    id: "social_follow",
    label: "Social Follow",
    icon: <Instagram className="w-5 h-5" />,
    description: "Grow your Instagram or TikTok following.",
  },
  {
    id: "birthday",
    label: "Birthday Reward",
    icon: <Gift className="w-5 h-5" />,
    description: "Send a special treat on their big day.",
  },
  {
    id: "newsletter",
    label: "Newsletter Sign-up",
    icon: <Mail className="w-5 h-5" />,
    description: "Build your email marketing list.",
  },
];
