import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Step2Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const Step2EntityDetails = ({ formData, updateFormData }: Step2Props) => {
  const isValid = 
    formData.entityName &&
    formData.inchargeName &&
    formData.inchargeMobile &&
    formData.inchargeMobile.length === 10;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="entityName">Company/Individual Name *</Label>
        <Input
          id="entityName"
          placeholder="Enter name"
          value={formData.entityName}
          onChange={(e) => updateFormData({ entityName: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inchargeName">In-charge Name *</Label>
        <Input
          id="inchargeName"
          placeholder="Enter in-charge name"
          value={formData.inchargeName}
          onChange={(e) => updateFormData({ inchargeName: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inchargeMobile">In-charge Mobile Number *</Label>
        <Input
          id="inchargeMobile"
          type="tel"
          placeholder="Enter 10-digit mobile number"
          value={formData.inchargeMobile}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            updateFormData({ inchargeMobile: value });
          }}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alternateNumber">Alternate Number (Optional)</Label>
        <Input
          id="alternateNumber"
          type="tel"
          placeholder="Enter 10-digit number"
          value={formData.alternateNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            updateFormData({ alternateNumber: value });
          }}
          className="h-12"
        />
      </div>

      {!isValid && (
        <p className="text-sm text-muted-foreground">
          Please fill in all required fields with valid data to proceed
        </p>
      )}
    </div>
  );
};

export default Step2EntityDetails;
