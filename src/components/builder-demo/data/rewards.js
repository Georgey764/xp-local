import { DollarSign, Percent, Gift } from "lucide-react";

export const rewardOptions = [
  {
    id: "cash",
    label: "Straight Cash ($)",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: "discount_pct",
    label: "Percentage Off (%)",
    icon: <Percent className="w-5 h-5" />,
  },
  {
    id: "discount_val",
    label: "Dollar Amount Off ($)",
    icon: <DollarSign className="w-5 h-5" />,
  },
  { id: "free_item", label: "Free Item", icon: <Gift className="w-5 h-5" /> },
];
