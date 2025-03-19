import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KpiCardProps {
  title: string;
  value: string;
  changePercent?: number;
  percent?: number;
  icon: React.ElementType;
  positiveChange?: boolean;
  additionalInfo?: string;
  percentOnly?: boolean;
  tooltip?: string;
}

export default function KpiCard({
  title,
  value,
  changePercent,
  percent,
  icon: Icon,
  positiveChange = true,
  additionalInfo = '',
  percentOnly = false,
  tooltip = ''
}: KpiCardProps) {
  const formatPercent = (val?: number): string =>
    val !== undefined ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : '';

  const content = (
    <Card className="hover:shadow-md transition-shadow duration-300 border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs mt-1">
          {!percentOnly && changePercent !== undefined && (
            <span className={positiveChange ? "text-green-600 flex items-center" : "text-red-600 flex items-center"}>
              {positiveChange ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {formatPercent(changePercent)}
            </span>
          )}
          {percent !== undefined && (
            <span className="text-muted-foreground">
              {percent.toFixed(1)}% {additionalInfo}
            </span>
          )}
          {!percentOnly && changePercent === undefined && percent === undefined && (
            <span className="text-muted-foreground">{additionalInfo}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : content;
}
