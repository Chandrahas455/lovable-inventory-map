import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const Step1Department = ({ formData, updateFormData, onNext }: Step1Props) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.department && formData.source;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="department">Department *</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => updateFormData({ department: value })}
        >
          <SelectTrigger id="department" className="h-12">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source *</Label>
        <Input
          id="source"
          placeholder="Enter source"
          value={formData.source}
          onChange={(e) => updateFormData({ source: e.target.value })}
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

export default Step1Department;
