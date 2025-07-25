import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ManageKPIs = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [selectedDay, setSelectedDay] = useState("23");
  const { toast } = useToast();

  const handleSaveKPIData = () => {
    toast({
      title: "KPI Data Saved",
      description: "Daily KPI data has been successfully saved.",
    });
  };

  const handleAddEmployee = () => {
    toast({
      title: "Employee Added",
      description: "New employee has been added to the system.",
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KPI Management</h1>
          <p className="text-muted-foreground mt-2">Add employees and manage daily KPI data</p>
        </div>

        {/* Employee Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Employee Management</span>
              <Badge variant="destructive">Admin Only</Badge>
            </CardTitle>
            <CardDescription>Add new employees to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input id="employee-name" placeholder="Enter employee name" />
              </div>
              <div>
                <Label htmlFor="employee-email">Employee Email</Label>
                <Input id="employee-email" placeholder="Enter employee email" type="email" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddEmployee} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily KPI Data Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Daily KPI Data Entry</span>
            </CardTitle>
            <CardDescription>Enter daily KPI data for employees</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Date and Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hasnat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hasnat">Hasnat</SelectItem>
                    <SelectItem value="ahmed">Ahmed</SelectItem>
                    <SelectItem value="sara">Sara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="August">August</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Day</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">New</Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
              <p className="text-success text-sm">✓ No data exists for this date. Ready for new entry.</p>
            </div>

            {/* KPI Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="margin">Margin (PKR)</Label>
                <Input id="margin" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="calls">Calls</Label>
                <Input id="calls" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="leads">Leads Generated</Label>
                <Input id="leads" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="solo-closing">Solo Closing</Label>
                <Input id="solo-closing" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="out-house">Out-House Meetings</Label>
                <Input id="out-house" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="in-house">In-House Meetings</Label>
                <Input id="in-house" placeholder="0" type="number" />
              </div>
              <div>
                <Label htmlFor="product-knowledge">Product Knowledge (%)</Label>
                <Input id="product-knowledge" placeholder="0" type="number" max="100" />
              </div>
              <div>
                <Label htmlFor="smd">SMD (%)</Label>
                <Input id="smd" placeholder="0" type="number" max="100" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveKPIData}>Save KPI Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageKPIs;