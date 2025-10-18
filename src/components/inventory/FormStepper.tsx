import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface FormStepperProps {
  steps: Step[];
}

const FormStepper = ({ steps }: FormStepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-secondary -z-10">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{
              width: `${(steps.filter((s) => s.completed).length / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Circles */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                step.completed
                  ? "bg-success border-success text-success-foreground"
                  : step.active
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-step-incomplete text-step-incomplete"
              )}
            >
              {step.completed ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block",
                step.active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStepper;
