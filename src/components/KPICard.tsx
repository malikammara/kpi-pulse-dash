import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface KPICardProps {
  title: string;
  achieved: number;
  target: number;
  weight: number;
  unit?: string;
}

const KPICard = ({ title, achieved, target, weight, unit = "" }: KPICardProps) => {
  const percentage = Math.min((achieved / target) * 100, 100);
  const isOnTrack = percentage >= 45; // Consider 45%+ as on track

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium text-foreground text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">Weight: {weight}%</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${isOnTrack ? 'bg-success' : 'bg-warning'}`} />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground">Achieved</p>
              <p className="text-2xl font-bold text-foreground">
                {achieved.toLocaleString()}{unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-medium text-muted-foreground">
                {target.toLocaleString()}{unit}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className="h-2"
            />
            <p className="text-right text-sm font-medium text-foreground">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;