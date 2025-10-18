import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Step3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const Step3AddressHierarchy = ({ formData, updateFormData }: Step3Props) => {
  const isValid = formData.district && formData.taluk && formData.firka && formData.village;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="district">District *</Label>
        <Input
          id="district"
          placeholder="Enter district"
          value={formData.district}
          onChange={(e) => updateFormData({ district: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taluk">Taluk *</Label>
        <Input
          id="taluk"
          placeholder="Enter taluk"
          value={formData.taluk}
          onChange={(e) => updateFormData({ taluk: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firka">Firka *</Label>
        <Input
          id="firka"
          placeholder="Enter firka"
          value={formData.firka}
          onChange={(e) => updateFormData({ firka: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="village">Village *</Label>
        <Input
          id="village"
          placeholder="Enter village"
          value={formData.village}
          onChange={(e) => updateFormData({ village: e.target.value })}
          className="h-12"
        />
      </div>

      {!isValid && (
        <p className="text-sm text-muted-foreground">
          Please fill in all required fields to proceed
        </p>
      )}
    </div>
  );
};

export default Step3AddressHierarchy;
