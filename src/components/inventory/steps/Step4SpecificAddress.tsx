import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

interface Step4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const Step4SpecificAddress = ({ formData, updateFormData }: Step4Props) => {
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const isFormValid = 
    formData.plotNo &&
    formData.street &&
    formData.locality &&
    formData.postalCode &&
    formData.postalCode.length === 6;

  const handleValidate = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setValidating(true);
    
    // Simulate geocoding (in real app, use Google Maps Geocoding API)
    setTimeout(() => {
      // Mock geocode data
      const mockLat = 11.0168 + Math.random() * 0.1;
      const mockLng = 76.9558 + Math.random() * 0.1;
      
      updateFormData({
        geocodeLat: mockLat,
        geocodeLng: mockLng,
      });
      
      setValidated(true);
      setValidating(false);
      toast.success("Location verified successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="plotNo">Plot No *</Label>
        <Input
          id="plotNo"
          placeholder="Enter plot number"
          value={formData.plotNo}
          onChange={(e) => updateFormData({ plotNo: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street *</Label>
        <Input
          id="street"
          placeholder="Enter street"
          value={formData.street}
          onChange={(e) => updateFormData({ street: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locality">Locality/City *</Label>
        <Input
          id="locality"
          placeholder="Enter locality or city"
          value={formData.locality}
          onChange={(e) => updateFormData({ locality: e.target.value })}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code *</Label>
        <Input
          id="postalCode"
          placeholder="Enter 6-digit postal code"
          value={formData.postalCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            updateFormData({ postalCode: value });
          }}
          className="h-12"
        />
      </div>

      <div className="pt-4">
        <Button
          onClick={handleValidate}
          disabled={!isFormValid || validating || validated}
          className="w-full h-12"
          variant={validated ? "outline" : "default"}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {validating ? "Validating..." : validated ? "Location Verified ✓" : "Validate Location"}
        </Button>
        {validated && (
          <p className="text-sm text-success mt-2 text-center">
            Location verified and saved
          </p>
        )}
      </div>

      {!validated && (
        <p className="text-sm text-muted-foreground">
          Please validate the location before proceeding
        </p>
      )}
    </div>
  );
};

export default Step4SpecificAddress;
