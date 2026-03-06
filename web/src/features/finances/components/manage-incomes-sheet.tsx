import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreateIncomeSource, useDeleteIncomeSource, useListIncomeSources } from "../hooks";
import { CreateIncomeSourceParamsSchema, type IncomeSource } from "../types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DialogProps } from "@/types";


export function ManageIncomesSheet({ spaceId, ...props }: { spaceId: number } & DialogProps) {
  const { t } = useTranslation()
  const incomeSources = useListIncomeSources({ spaceId });
  const totalIncome = incomeSources.data?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
  return (
    <Sheet {...props}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            {t("Monthly Income Breakdown")}
          </SheetTitle>
          <SheetDescription>
            {t("Manage your household income sources")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          <div className="rounded-lg border px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">{t("Total Monthly Income")}</span>
            <span className="text-lg font-bold">{formatCurrency(totalIncome)}</span>
          </div>

          <IncomeSourceList spaceId={spaceId} sources={incomeSources.data ?? []} />
        </div>

        <div className="border-t px-4 py-4">
          <AddIncomeSourceForm spaceId={spaceId} />
        </div>
      </SheetContent>
    </Sheet>

  )
}


function IncomeSourceList({ spaceId, sources }: { spaceId: number; sources: IncomeSource[] }) {
  const { t } = useTranslation();
  const deleteIncomeSource = useDeleteIncomeSource();

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium">{t("No income sources yet")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('Click "Add Income Source" to get started')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <div
          key={source.id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{source.name}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold">{formatCurrency(source.amount)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={deleteIncomeSource.isPending}
              onClick={() =>
                deleteIncomeSource.mutate({ spaceId, incomeSourceId: source.id })
              }
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddIncomeSourceForm({ spaceId }: { spaceId: number }) {
  const { t } = useTranslation();
  const createIncomeSource = useCreateIncomeSource();
  const form = useForm({
    resolver: zodResolver(CreateIncomeSourceParamsSchema),
    defaultValues: {
      spaceId,
      name: "",
      amount: 0,
    },
  });

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit((data) => {
      createIncomeSource.mutate(data, {
        onSuccess: () => {
          form.reset();
        },
      });
    })(e);
  };

  const isDisabled = !form.formState.isValid || createIncomeSource.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Field orientation="horizontal">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel htmlFor={field.name}>{t("Name")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder={t("e.g. Salary")}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-32">
              <FieldLabel htmlFor={field.name}>{t("Amount")}</FieldLabel>
              <Input
                type="number"
                min={1}
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" size="icon" className="mt-auto shrink-0" disabled={isDisabled}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </Field>
    </form>
  );
}
