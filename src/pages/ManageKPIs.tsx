import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BarChart3, Settings, Pencil, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { useEmployees, useAddEmployee } from "@/hooks/useEmployees";
import { useKPIData, useAddKPIData } from "@/hooks/useKPIData";
import { useAdminEmails, useAddAdminEmail } from "@/hooks/useAdminEmails";

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const ManageKPIs = () => {
  // State
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString());
  const [kpiValues, setKpiValues] = useState({
    margin: "",
    calls: "",
    leads_generated: "",
    solo_closing: "",
    out_house_meetings: "",
    in_house_meetings: "",
    product_knowledge: "",
    smd: "",
  });
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Inline table edit state
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Hooks
  const { data: employees = [] } = useEmployees();
  const { data: adminEmails = [] } = useAdminEmails();
  const addEmployee = useAddEmployee();
  const addKPIData = useAddKPIData();
  const addAdminEmail = useAddAdminEmail();

  const currentYear = new Date().getFullYear();
  const selectedDate = `${currentYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;

  const { data: existingKPIData = [] } = useKPIData({
    employeeId: selectedEmployee,
    month: selectedMonth,
    year: currentYear.toString(),
  });

  const dayData = existingKPIData?.find(data => data.date === selectedDate);

  // Auto-load KPI data when dropdowns or dayData changes
  useEffect(() => {
    if (dayData) {
      setKpiValues({
        margin: dayData.margin?.toString() || "",
        calls: dayData.calls?.toString() || "",
        leads_generated: dayData.leads_generated?.toString() || "",
        solo_closing: dayData.solo_closing?.toString() || "",
        out_house_meetings: dayData.out_house_meetings?.toString() || "",
        in_house_meetings: dayData.in_house_meetings?.toString() || "",
        product_knowledge: dayData.product_knowledge?.toString() || "",
        smd: dayData.smd?.toString() || "",
      });
    } else {
      setKpiValues({
        margin: "",
        calls: "",
        leads_generated: "",
        solo_closing: "",
        out_house_meetings: "",
        in_house_meetings: "",
        product_knowledge: "",
        smd: "",
      });
    }
  }, [selectedEmployee, selectedMonth, selectedDay, dayData]);

  // Handlers
  const handleAddEmployee = async () => {
    if (!employeeName.trim() || !employeeEmail.trim()) return;
    try {
      await addEmployee.mutateAsync({
        name: employeeName.trim(),
        email: employeeEmail.trim(),
      });
      setEmployeeName("");
      setEmployeeEmail("");
    } catch {}
  };

  const handleSaveKPIData = async () => {
    if (!selectedEmployee) return;
    try {
      await addKPIData.mutateAsync({
        employee_id: selectedEmployee,
        date: selectedDate,
        margin: parseFloat(kpiValues.margin) || 0,
        calls: parseInt(kpiValues.calls) || 0,
        leads_generated: parseInt(kpiValues.leads_generated) || 0,
        solo_closing: parseInt(kpiValues.solo_closing) || 0,
        out_house_meetings: parseInt(kpiValues.out_house_meetings) || 0,
        in_house_meetings: parseInt(kpiValues.in_house_meetings) || 0,
        product_knowledge: parseFloat(kpiValues.product_knowledge) || 0,
        smd: parseFloat(kpiValues.smd) || 0,
      });
      setKpiValues({
        margin: "",
        calls: "",
        leads_generated: "",
        solo_closing: "",
        out_house_meetings: "",
        in_house_meetings: "",
        product_knowledge: "",
        smd: "",
      });
    } catch {}
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      await addAdminEmail.mutateAsync({
        email: newAdminEmail.trim(),
      });
      setNewAdminEmail("");
    } catch {}
  };

  // --- Table Edit Handlers ---
  const handleEdit = (idx, daysArray) => {
    setEditRow(idx);
    setEditValues({
      margin: daysArray[idx].margin || "",
      calls: daysArray[idx].calls || "",
      leads_generated: daysArray[idx].leads_generated || "",
      solo_closing: daysArray[idx].solo_closing || "",
      out_house_meetings: daysArray[idx].out_house_meetings || "",
      in_house_meetings: daysArray[idx].in_house_meetings || "",
      product_knowledge: daysArray[idx].product_knowledge || "",
      smd: daysArray[idx].smd || "",
    });
  };
  const handleChange = (field, val) => {
    setEditValues((prev) => ({ ...prev, [field]: val }));
  };
  const handleSave = async (idx, daysArray) => {
    try {
      await addKPIData.mutateAsync({
        employee_id: selectedEmployee,
        date: daysArray[idx].date,
        margin: parseFloat(editValues.margin) || 0,
        calls: parseInt(editValues.calls) || 0,
        leads_generated: parseInt(editValues.leads_generated) || 0,
        solo_closing: parseInt(editValues.solo_closing) || 0,
        out_house_meetings: parseInt(editValues.out_house_meetings) || 0,
        in_house_meetings: parseInt(editValues.in_house_meetings) || 0,
        product_knowledge: parseFloat(editValues.product_knowledge) || 0,
        smd: parseFloat(editValues.smd) || 0,
      });
      setEditRow(null);
    } catch {}
  };
  const handleCancel = () => setEditRow(null);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // ----------- Tabs content below ------------------
  const renderKPITab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Daily KPI Data Entry</span>
        </CardTitle>
        <CardDescription>Enter daily KPI data for employees</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
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
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
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
        </div>

        {dayData ? (
          <div className="bg-muted border border-border rounded-lg p-4 mb-6">
            <p className="text-muted-foreground text-sm">Data loaded for this date. You can edit and save again.</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">✓ No data exists for this date. Ready for new entry.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <Label htmlFor="margin">Margin (PKR)</Label>
            <Input
              id="margin"
              placeholder="0"
              type="number"
              value={kpiValues.margin}
              onChange={e => setKpiValues(val => ({ ...val, margin: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="calls">Calls</Label>
            <Input
              id="calls"
              placeholder="0"
              type="number"
              value={kpiValues.calls}
              onChange={e => setKpiValues(val => ({ ...val, calls: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="leads">Leads Generated</Label>
            <Input
              id="leads"
              placeholder="0"
              type="number"
              value={kpiValues.leads_generated}
              onChange={e => setKpiValues(val => ({ ...val, leads_generated: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="solo-closing">Solo Closing</Label>
            <Input
              id="solo-closing"
              placeholder="0"
              type="number"
              value={kpiValues.solo_closing}
              onChange={e => setKpiValues(val => ({ ...val, solo_closing: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="out-house">Out-House Meetings</Label>
            <Input
              id="out-house"
              placeholder="0"
              type="number"
              value={kpiValues.out_house_meetings}
              onChange={e => setKpiValues(val => ({ ...val, out_house_meetings: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="in-house">In-House Meetings</Label>
            <Input
              id="in-house"
              placeholder="0"
              type="number"
              value={kpiValues.in_house_meetings}
              onChange={e => setKpiValues(val => ({ ...val, in_house_meetings: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="product-knowledge">Product Knowledge (%)</Label>
            <Input
              id="product-knowledge"
              placeholder="0"
              type="number"
              max="100"
              value={kpiValues.product_knowledge}
              onChange={e => setKpiValues(val => ({ ...val, product_knowledge: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="smd">SMD (%)</Label>
            <Input
              id="smd"
              placeholder="0"
              type="number"
              max="100"
              value={kpiValues.smd}
              onChange={e => setKpiValues(val => ({ ...val, smd: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveKPIData} className="bg-primary hover:bg-primary/80 text-primary-foreground">
            Save KPI Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmployeeAdminTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Employee Management</span>
          <Badge variant="destructive">Admin Only</Badge>
        </CardTitle>
        <CardDescription>Add new employees to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="employee-name">Employee Name</Label>
            <Input 
              id="employee-name" 
              placeholder="Enter employee name" 
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="employee-email">Employee Email</Label>
            <Input 
              id="employee-email" 
              placeholder="Enter employee email" 
              type="email"
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleAddEmployee} 
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
              disabled={addEmployee.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addEmployee.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </div>
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Admin Email Management</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-email">Add Admin Email</Label>
              <Input 
                id="admin-email" 
                placeholder="Enter admin email" 
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddAdmin} 
                className="bg-primary hover:bg-primary/80 text-primary-foreground"
                disabled={addAdminEmail.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addAdminEmail.isPending ? "Adding..." : "Add Admin"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // NEW: Daily KPI List Tab
  const renderKPIListTab = () => {
    const year = currentYear;
    const month = parseInt(selectedMonth);
    const totalDays = daysInMonth(year, month);
    const daysArray = Array.from({ length: totalDays }, (_, i) => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      const data = existingKPIData?.find((d) => d.date === dateStr) || {};
      return { date: dateStr, ...data };
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Daily KPI List</span>
          </CardTitle>
          <CardDescription>
            View & edit daily KPIs for each day of the month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div>
              <Label>Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
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
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 border">Day</th>
                  <th className="p-2 border">Margin</th>
                  <th className="p-2 border">Calls</th>
                  <th className="p-2 border">Leads</th>
                  <th className="p-2 border">Solo</th>
                  <th className="p-2 border">OH Mtgs</th>
                  <th className="p-2 border">IH Mtgs</th>
                  <th className="p-2 border">Knowledge %</th>
                  <th className="p-2 border">SMD %</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {daysArray.map((row, idx) => (
                  <tr key={row.date} className={idx % 2 ? "bg-muted/50" : ""}>
                    <td className="p-2 border font-semibold">{idx + 1}</td>
                    {editRow === idx ? (
                      <>
                        <td className="p-2 border"><Input value={editValues.margin} onChange={e => handleChange("margin", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.calls} onChange={e => handleChange("calls", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.leads_generated} onChange={e => handleChange("leads_generated", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.solo_closing} onChange={e => handleChange("solo_closing", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.out_house_meetings} onChange={e => handleChange("out_house_meetings", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.in_house_meetings} onChange={e => handleChange("in_house_meetings", e.target.value)} type="number" /></td>
                        <td className="p-2 border"><Input value={editValues.product_knowledge} onChange={e => handleChange("product_knowledge", e.target.value)} type="number" max={100} /></td>
                        <td className="p-2 border"><Input value={editValues.smd} onChange={e => handleChange("smd", e.target.value)} type="number" max={100} /></td>
                        <td className="p-2 border">
                          <Button size="icon" onClick={() => handleSave(idx, daysArray)} className="mr-1" variant="success"><Check className="h-4 w-4" /></Button>
                          <Button size="icon" onClick={handleCancel} variant="outline"><X className="h-4 w-4" /></Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 border">{row.margin ?? ""}</td>
                        <td className="p-2 border">{row.calls ?? ""}</td>
                        <td className="p-2 border">{row.leads_generated ?? ""}</td>
                        <td className="p-2 border">{row.solo_closing ?? ""}</td>
                        <td className="p-2 border">{row.out_house_meetings ?? ""}</td>
                        <td className="p-2 border">{row.in_house_meetings ?? ""}</td>
                        <td className="p-2 border">{row.product_knowledge ?? ""}</td>
                        <td className="p-2 border">{row.smd ?? ""}</td>
                        <td className="p-2 border">
                          <Button size="icon" onClick={() => handleEdit(idx, daysArray)} variant="outline"><Pencil className="h-4 w-4" /></Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ----------------------- Layout -------------------------------
  return (
    <div className="min-h-screen bg-background">
      <Layout>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">KPI Management</h1>
            <p className="text-muted-foreground mt-2">Add employees, manage admins, and enter daily KPIs</p>
          </div>
          <Tab.Group>
            {/* Centered Tabs */}
            <div className="w-full flex justify-center mb-8">
              <Tab.List className="inline-flex bg-muted p-2 rounded-xl shadow-sm border border-border gap-2">
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "px-8 py-2 rounded-lg font-semibold transition focus:outline-none text-lg",
                      selected
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-card text-primary hover:bg-muted"
                    )
                  }
                >
                  Daily KPI Management
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "px-8 py-2 rounded-lg font-semibold transition focus:outline-none text-lg",
                      selected
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-card text-primary hover:bg-muted"
                    )
                  }
                >
                  Employee & Admin Adding
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "px-8 py-2 rounded-lg font-semibold transition focus:outline-none text-lg",
                      selected
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-card text-primary hover:bg-muted"
                    )
                  }
                >
                  Daily KPI List
                </Tab>
              </Tab.List>
            </div>
            <Tab.Panels>
              <Tab.Panel>{renderKPITab()}</Tab.Panel>
              <Tab.Panel>{renderEmployeeAdminTab()}</Tab.Panel>
              <Tab.Panel>{renderKPIListTab()}</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Layout>
    </div>
  );
};

export default ManageKPIs;
