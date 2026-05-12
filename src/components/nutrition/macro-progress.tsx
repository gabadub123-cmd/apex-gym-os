interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
}

export function MacroProgress({
  label,
  current,
  target,
  unit,
  color,
  bgColor,
}: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const over = current > target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className={`text-xs ${over ? "text-red-400" : "text-muted-foreground"}`}>
          {Math.round(current)} / {target} {unit}
        </span>
      </div>
      <div className={`h-2.5 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            over ? "bg-red-400" : color
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-right">
        {pct}%{over ? " (over)" : ""}
      </p>
    </div>
  );
}

export function MacroSummary({
  protein,
  carbs,
  fat,
  calories,
  targets,
}: {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  targets: { protein_g?: number; carbs_g?: number; fat_g?: number; calories?: number };
}) {
  return (
    <div className="space-y-3">
      <MacroProgress
        label="Protein"
        current={protein}
        target={targets.protein_g || 0}
        unit="g"
        color="bg-blue-400"
        bgColor="bg-blue-500/20"
      />
      <MacroProgress
        label="Carbs"
        current={carbs}
        target={targets.carbs_g || 0}
        unit="g"
        color="bg-amber-400"
        bgColor="bg-amber-500/20"
      />
      <MacroProgress
        label="Fat"
        current={fat}
        target={targets.fat_g || 0}
        unit="g"
        color="bg-red-400"
        bgColor="bg-red-500/20"
      />
      <MacroProgress
        label="Calories"
        current={calories}
        target={targets.calories || 0}
        unit="kcal"
        color="bg-green-400"
        bgColor="bg-green-500/20"
      />
    </div>
  );
}
