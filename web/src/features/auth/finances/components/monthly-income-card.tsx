import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { DollarSignIcon } from "lucide-react";
import { data } from "../dummy-data";

export function MonthlyIncomeCard() {
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Monthly Income
        </CardTitle>
        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(data.monthlyIncome)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          0 income{" "}
          sources • Click to manage
        </p>
      </CardContent>
    </Card>
  )
}
