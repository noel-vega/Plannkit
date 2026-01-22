import { icons, type LucideProps } from "lucide-react";
import z from "zod/v3";

// Get all icon names as a tuple
const iconNames = Object.keys(icons) as [keyof typeof icons, ...Array<keyof typeof icons>];

// Create the Zod enum
export const IconNameSchema = z.enum(iconNames);

// Infer the type if needed
export type IconName = z.infer<typeof IconNameSchema>;

interface DynamicIconProps extends LucideProps {
  name: keyof typeof icons;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon {...props} />;
};
