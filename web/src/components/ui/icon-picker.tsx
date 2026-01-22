import { DynamicIcon, type IconName } from "./dynamic-icon"
import { cn } from "@/lib/utils"
import { Button } from "./button"



interface IconCategory {
  category: string
  list: string[]
}

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  icons: IconCategory[]
  className?: string
}

export function IconPicker({ onChange, icons, className }: IconPickerProps) {


  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-6">
        {icons.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-semibold mb-3 text-foreground/70">
              {category.category}
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {category.list.map((iconName) => (
                <Button
                  variant="outline"
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  title={iconName}
                >
                  <DynamicIcon
                    name={iconName as IconName}
                    className="size-5"
                  />
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const icons: { category: string, list: IconName[] }[] = [
  {
    category: "Health & Wellness",
    list: [
      "Activity",
      "Dumbbell",
      "HeartPulse",
      "Heart",
      "Footprints",
      "Bike",
      "Apple",
      "Salad",
      "Droplet",
      "Pill",
      "Stethoscope",
      "Thermometer",
      "PersonStanding",
      "Weight"
    ]
  },
  {
    category: "Mind & Learning",
    list: [
      "Brain",
      "BookOpen",
      "Book",
      "GraduationCap",
      "Lightbulb",
      "Languages",
      "Library",
      "Sparkles",
      "Target",
      "Trophy",
      "Puzzle",
      "Rocket"
    ]
  },
  {
    category: "Work & Productivity",
    list: [
      "Briefcase",
      "Code",
      "Laptop",
      "Calendar",
      "ClipboardCheck",
      "FileText",
      "PenTool",
      "ListTodo",
      "Timer",
      "Clock",
      "Focus",
      "Zap"
    ]
  },
  {
    category: "Creative & Hobbies",
    list: [
      "Palette",
      "Music",
      "Camera",
      "Film",
      "Paintbrush",
      "Pencil",
      "Guitar",
      "Mic",
      "Scissors",
      "Shapes",
      "Image",
      "Newspaper"
    ]
  },
  {
    category: "Social & Relationships",
    list: [
      "Users",
      "UserPlus",
      "MessageCircle",
      "Phone",
      "Mail",
      "Gift",
      "PartyPopper",
      "Handshake",
      "Baby",
      "Dog",
      "Cat"
    ]
  },
  {
    category: "Mindfulness & Spirituality",
    list: [
      "Sparkle",
      "Moon",
      "Sun",
      "Sunrise",
      "CloudSun",
      "Wind",
      "Leaf",
      "Flower",
      "Trees",
      "Mountain",
      "Flame",
    ]
  },
  {
    category: "Lifestyle & Self-Care",
    list: [
      "BedDouble",
      "ShowerHead",
      "Coffee",
      "UtensilsCrossed",
      "ShoppingBag",
      "Shirt",
      "Sparkles",
      "Smile",
      "Bath",
      "Scissors",
      "Watch",
    ]
  },
  {
    category: "Finance & Career",
    list: [
      "DollarSign",
      "PiggyBank",
      "Wallet",
      "CreditCard",
      "TrendingUp",
      "Calculator",
      "Coins",
      "Landmark",
      "Building"
    ]
  },
  {
    category: "Environment & Nature",
    list: [
      "Leaf",
      "Recycle",
      "TreeDeciduous",
      "TreePine",
      "Flower2",
      "Sprout",
      "Globe",
      "CloudRain",
      "Bug",
      "Bird",
      "Fish",
      "Waves"
    ]
  },
  {
    category: "Entertainment & Fun",
    list: [
      "Gamepad2",
      "Tv",
      "Popcorn",
      "Pizza",
      "Cake",
      "Wine",
      "Beer",
      "Plane",
      "Map",
      "Tent",
      "Compass"
    ]
  }
]
