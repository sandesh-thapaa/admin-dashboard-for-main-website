
export interface StatData {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    type: "success" | "warning" | "neutral";
    icon?: React.ReactNode;
    text: string;
  };
}
