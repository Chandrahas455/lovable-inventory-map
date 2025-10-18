import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FormStepper from "@/components/inventory/FormStepper";
import Step1Department from "@/components/inventory/steps/Step1Department";
import Step2EntityDetails from "@/components/inventory/steps/Step2EntityDetails";
import Step3AddressHierarchy from "@/components/inventory/steps/Step3AddressHierarchy";
import Step4SpecificAddress from "@/components/inventory/steps/Step4SpecificAddress";
import Step5Equipment from "@/components/inventory/steps/Step5Equipment";
import Step6Review from "@/components/inventory/steps/Step6Review";

interface FormData {
  department: string;
  source: string;
  entityName: string;
  inchargeName: string;
  inchargeMobile: string;
  alternateNumber: string;
  district: string;
  taluk: string;
  firka: string;
  village: string;
  plotNo: string;
  street: string;
  locality: string;
  postalCode: string;
  geocodeLat: number | null;
  geocodeLng: number | null;
  equipment: Array<{ name: string; quantity: number }>;
  functionalStatus: "yes" | "no" | "";
}

const InventoryForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({
    department: "",
    source: "",
    entityName: "",
    inchargeName: "",
    inchargeMobile: "",
    alternateNumber: "",
    district: "",
    taluk: "",
    firka: "",
    village: "",
    plotNo: "",
    street: "",
    locality: "",
    postalCode: "",
    geocodeLat: null,
    geocodeLng: null,
    equipment: [],
    functionalStatus: "",
  });

  const steps = [
    { id: 1, title: "Department", completed: completedSteps.includes(1), active: currentStep === 1 },
    { id: 2, title: "Entity", completed: completedSteps.includes(2), active: currentStep === 2 },
    { id: 3, title: "Address", completed: completedSteps.includes(3), active: currentStep === 3 },
    { id: 4, title: "Location", completed: completedSteps.includes(4), active: currentStep === 4 },
    { id: 5, title: "Equipment", completed: completedSteps.includes(5), active: currentStep === 5 },
    { id: 6, title: "Review", completed: completedSteps.includes(6), active: currentStep === 6 },
  ];

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const handleNext = () => {
    markStepComplete(currentStep);
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Department formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        return <Step2EntityDetails formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 3:
        return <Step3AddressHierarchy formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 4:
        return <Step4SpecificAddress formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 5:
        return <Step5Equipment formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 6:
        return <Step6Review formData={formData} completedSteps={completedSteps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">New Inventory Entry</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of 6</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="container mx-auto px-4">
        <FormStepper steps={steps} />
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
        <div className="container mx-auto flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="h-12 px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === 6}
            className="h-12 px-6"
          >
            {currentStep === 6 ? "Submit" : "Next"}
            {currentStep !== 6 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
