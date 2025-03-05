import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function KpiCard({
  title,
  value,
  changePercent,
  percent,
  icon: Icon,
  positiveChange = true,
  additionalInfo = '',
  percentOnly = false
}: {
  title: string;
  value: string;
  changePercent?: number;
  percent?: number;
  icon: React.ElementType;
  positiveChange?: boolean;
  additionalInfo?: string;
  percentOnly?: boolean;
}) {

  return (

    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {!percentOnly && changePercent !== undefined ? (
            positiveChange ? (
              <span className="text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +{changePercent.toFixed(2)}%
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                {changePercent.toFixed(2)}%
              </span>
            )
          ) : (
            percent !== undefined && (
              <span className="text-muted-foreground">
                {percent.toFixed(1)}% {additionalInfo}
              </span>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
