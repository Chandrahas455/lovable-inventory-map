import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Equipment {
  name: string;
  quantity: number;
}

interface Step5Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const Step5Equipment = ({ formData, updateFormData }: Step5Props) => {
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string }[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment_master")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setEquipmentList(data || []);
    } catch (error: any) {
      toast.error("Failed to load equipment");
    }
  };

  const handleAddEquipment = () => {
    if (!selectedEquipment || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please select equipment and enter a valid quantity");
      return;
    }

    const equipment: Equipment[] = [...(formData.equipment || [])];
    equipment.push({ name: selectedEquipment, quantity: parseInt(quantity) });
    updateFormData({ equipment });
    setSelectedEquipment("");
    setQuantity("");
    toast.success("Equipment added");
  };

  const handleRemoveEquipment = (index: number) => {
    const equipment = [...formData.equipment];
    equipment.splice(index, 1);
    updateFormData({ equipment });
  };

  const isValid = formData.equipment?.length > 0 && formData.functionalStatus;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Add Equipment *</Label>
        <div className="flex gap-2">
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipmentList.map((equip) => (
                <SelectItem key={equip.id} value={equip.name}>
                  {equip.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-24 h-12"
            min="1"
          />
          <Button onClick={handleAddEquipment} size="icon" className="h-12 w-12">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {formData.equipment?.length > 0 && (
        <div className="space-y-2">
          <Label>Added Equipment</Label>
          <div className="space-y-2">
            {formData.equipment.map((item: Equipment, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEquipment(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label>Functional Status *</Label>
        <RadioGroup
          value={formData.functionalStatus}
          onValueChange={(value) => updateFormData({ functionalStatus: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes" className="font-normal cursor-pointer">
              Yes - All equipment is functional
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no" className="font-normal cursor-pointer">
              No - Some equipment needs repair
            </Label>
          </div>
        </RadioGroup>
      </div>

      {!isValid && (
        <p className="text-sm text-muted-foreground">
          Please add at least one equipment item and select functional status
        </p>
      )}
    </div>
  );
};

export default Step5Equipment;
