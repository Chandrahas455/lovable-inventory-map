import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, AlertCircle } from "lucide-react";

interface Step6Props {
  formData: any;
  completedSteps: number[];
}

const Step6Review = ({ formData, completedSteps }: Step6Props) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const allStepsComplete = completedSteps.length === 5;

  const handleSubmit = async () => {
    if (!allStepsComplete) {
      toast.error("Please complete all steps before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert inventory entry
      const { data: entry, error: entryError } = await supabase
        .from("inventory_entries")
        .insert({
          user_id: user.id,
          department_id: formData.department,
          source: formData.source,
          entity_name: formData.entityName,
          incharge_name: formData.inchargeName,
          incharge_mobile: formData.inchargeMobile,
          alternate_number: formData.alternateNumber || null,
          district: formData.district,
          taluk: formData.taluk,
          firka: formData.firka,
          village: formData.village,
          plot_no: formData.plotNo,
          street: formData.street,
          locality: formData.locality,
          postal_code: formData.postalCode,
          geocode_lat: formData.geocodeLat,
          geocode_lng: formData.geocodeLng,
          functional_status: formData.functionalStatus,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Insert equipment items
      const equipmentItems = formData.equipment.map((item: any) => ({
        inventory_entry_id: entry.id,
        equipment_name: item.name,
        quantity: item.quantity,
      }));

      const { error: equipmentError } = await supabase
        .from("equipment_items")
        .insert(equipmentItems);

      if (equipmentError) throw equipmentError;

      toast.success("Inventory entry submitted successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!allStepsComplete && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            Please complete all previous steps before submitting
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Department & Source</h3>
          <p className="text-sm text-muted-foreground">{formData.source}</p>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-2">Entity Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Entity:</span> {formData.entityName}</p>
            <p><span className="font-medium">In-charge:</span> {formData.inchargeName}</p>
            <p><span className="font-medium">Mobile:</span> {formData.inchargeMobile}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-2">Address</h3>
          <div className="space-y-1 text-sm">
            <p>{formData.plotNo}, {formData.street}</p>
            <p>{formData.locality}</p>
            <p>{formData.village}, {formData.firka}</p>
            <p>{formData.taluk}, {formData.district}</p>
            <p>PIN: {formData.postalCode}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-2">Equipment ({formData.equipment?.length || 0} items)</h3>
          <div className="space-y-2">
            {formData.equipment?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm p-2 bg-secondary rounded">
                <span>{item.name}</span>
                <span className="text-muted-foreground">Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-2">Functional Status</h3>
          <p className="text-sm capitalize">{formData.functionalStatus}</p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!allStepsComplete || submitting}
        className="w-full h-12"
      >
        {submitting ? "Submitting..." : "Submit Entry"}
        {allStepsComplete && <Check className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default Step6Review;
