import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { DollarSignIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useListIncomeSources } from "../hooks";
import type { IncomeSource } from "../types";

type MonthlyIncomeCardProps = {
  spaceId: number;
  incomeSources: IncomeSource[];
};

export function MonthlyIncomeCard({ spaceId, incomeSources: initialData }: MonthlyIncomeCardProps) {
  const { t } = useTranslation();
  const incomeSources = useListIncomeSources({ spaceId, initialData });
  const totalIncome = incomeSources.data?.reduce((sum, s) => sum + s.amount, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("Monthly Income")}
        </CardTitle>
        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(totalIncome)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {incomeSources.data?.length} {t("sources")} &middot; {t("Click to manage")}
        </p>
      </CardContent>
    </Card>
  );
}

