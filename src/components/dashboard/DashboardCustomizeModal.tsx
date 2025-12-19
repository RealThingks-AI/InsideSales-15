import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GripVertical, FileText, Users, Briefcase, Clock, TrendingUp, Zap, BarChart3 } from "lucide-react";

export type WidgetKey = "leads" | "contacts" | "deals" | "actionItems" | "performance" | "quickActions" | "leadStatus";

export interface DashboardWidget {
  key: WidgetKey;
  label: string;
  icon: React.ReactNode;
  visible: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { key: "leads", label: "My Leads", icon: <FileText className="w-4 h-4" />, visible: true },
  { key: "contacts", label: "My Contacts", icon: <Users className="w-4 h-4" />, visible: true },
  { key: "deals", label: "My Deals", icon: <Briefcase className="w-4 h-4" />, visible: true },
  { key: "actionItems", label: "Action Items", icon: <Clock className="w-4 h-4" />, visible: true },
  { key: "performance", label: "My Performance", icon: <TrendingUp className="w-4 h-4" />, visible: true },
  { key: "quickActions", label: "Quick Actions", icon: <Zap className="w-4 h-4" />, visible: true },
  { key: "leadStatus", label: "Lead Status Overview", icon: <BarChart3 className="w-4 h-4" />, visible: true },
];

interface DashboardCustomizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleWidgets: WidgetKey[];
  onSave: (visibleWidgets: WidgetKey[]) => void;
  isSaving?: boolean;
}

export const DashboardCustomizeModal = ({
  open,
  onOpenChange,
  visibleWidgets,
  onSave,
  isSaving = false,
}: DashboardCustomizeModalProps) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    // Initialize widgets state based on current visibility
    const initialWidgets = DEFAULT_WIDGETS.map(w => ({
      ...w,
      visible: visibleWidgets.includes(w.key),
    }));
    setWidgets(initialWidgets);
  }, [visibleWidgets, open]);

  const toggleWidget = (key: WidgetKey) => {
    setWidgets(prev =>
      prev.map(w => (w.key === key ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleSave = () => {
    const visible = widgets.filter(w => w.visible).map(w => w.key);
    onSave(visible);
  };

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS.map(w => ({ ...w, visible: true })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Choose which widgets to display on your dashboard.
          </p>
          
          <div className="space-y-3">
            {widgets.map((widget) => (
              <div
                key={widget.key}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                  <div className="text-muted-foreground">{widget.icon}</div>
                  <Label htmlFor={widget.key} className="cursor-pointer font-medium">
                    {widget.label}
                  </Label>
                </div>
                <Switch
                  id={widget.key}
                  checked={widget.visible}
                  onCheckedChange={() => toggleWidget(widget.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReset} className="sm:mr-auto">
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DEFAULT_WIDGETS };
