import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  Building, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  MessageSquare,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useState, useMemo } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { 
  useContacts, 
  useAddContact, 
  useUpdateContact,
  useContactFollowups,
  useAddContactFollowup,
  useUpdateContactFollowup,
  useContactMeetings,
  useAddContactMeeting,
  useContactAccounts,
  useAddContactAccount,
  useUpdateContactAccount,
  Contact,
  ContactFollowup,
  ContactMeeting,
  ContactAccount
} from "@/hooks/useContacts";

const CRM = () => {
  const { user, isAdmin } = useAuth();
  const { data: employees = [] } = useEmployees();
  
  // Get current employee
  const myEmployee = useMemo(
    () => employees.find((e) => e.email === user?.email),
    [employees, user]
  );

  // State for forms
  const [selectedEmployee, setSelectedEmployee] = useState(isAdmin ? "all" : myEmployee?.id || "");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    category: "new" as Contact['category'],
    notes: "",
    source: ""
  });

  // Followup form state
  const [followupForm, setFollowupForm] = useState({
    contact_id: "",
    followup_date: "",
    comments: "",
    next_followup_date: ""
  });

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    contact_id: "",
    meeting_date: "",
    meeting_type: "in_person" as ContactMeeting['meeting_type'],
    duration_minutes: "",
    outcome: "",
    notes: "",
    next_steps: "",
    follow_up_required: false,
    follow_up_date: ""
  });

  // Account form state
  const [accountForm, setAccountForm] = useState({
    contact_id: "",
    account_opening_date: "",
    account_number: "",
    initial_margin: "",
    current_margin: "",
    notes: ""
  });

  // Hooks
  const employeeIdForQuery = selectedEmployee === "all" ? undefined : selectedEmployee;
  const { data: contacts = [] } = useContacts(employeeIdForQuery);
  const { data: followups = [] } = useContactFollowups(undefined, employeeIdForQuery);
  const { data: meetings = [] } = useContactMeetings(undefined, employeeIdForQuery);
  const { data: accounts = [] } = useContactAccounts(undefined, employeeIdForQuery);
  
  const addContact = useAddContact();
  const updateContact = useUpdateContact();
  const addFollowup = useAddContactFollowup();
  const updateFollowup = useUpdateContactFollowup();
  const addMeeting = useAddContactMeeting();
  const addAccount = useAddContactAccount();
  const updateAccount = useUpdateContactAccount();

  // Filter contacts by category
  const filteredContacts = useMemo(() => {
    if (selectedCategory === "all") return contacts;
    return contacts.filter(contact => contact.category === selectedCategory);
  }, [contacts, selectedCategory]);

  // Get upcoming followups (next 7 days)
  const upcomingFollowups = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return followups.filter(followup => {
      if (!followup.next_followup_date || followup.completed) return false;
      const followupDate = new Date(followup.next_followup_date);
      return followupDate >= now && followupDate <= nextWeek;
    });
  }, [followups]);

  // Category options
  const categoryOptions = [
    { value: "all", label: "All Contacts", color: "bg-gray-100" },
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    { value: "interested", label: "Interested", color: "bg-green-100 text-green-800" },
    { value: "not_interested", label: "Not Interested", color: "bg-red-100 text-red-800" },
    { value: "sent_details", label: "Sent Details", color: "bg-yellow-100 text-yellow-800" },
    { value: "in_followup", label: "In Followup", color: "bg-purple-100 text-purple-800" },
    { value: "will_show_meeting", label: "Will Show Meeting", color: "bg-indigo-100 text-indigo-800" },
    { value: "meeting_done", label: "Meeting Done", color: "bg-teal-100 text-teal-800" },
    { value: "account_opened", label: "Account Opened", color: "bg-emerald-100 text-emerald-800" }
  ];

  const getCategoryBadge = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? { label: option.label, className: option.color } : { label: category, className: "bg-gray-100" };
  };

  // Handlers
  const handleAddContact = async () => {
    if (!contactForm.name.trim() || !selectedEmployee) return;
    
    try {
      await addContact.mutateAsync({
        ...contactForm,
        employee_id: selectedEmployee === "all" ? myEmployee?.id || "" : selectedEmployee
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        category: "new",
        notes: "",
        source: ""
      });
      setShowAddContact(false);
    } catch (error) {
      console.error("Failed to add contact:", error);
    }
  };

  const handleAddFollowup = async () => {
    if (!followupForm.contact_id || !followupForm.followup_date) return;
    
    try {
      await addFollowup.mutateAsync({
        ...followupForm,
        employee_id: selectedEmployee === "all" ? myEmployee?.id || "" : selectedEmployee,
        completed: false,
        notification_sent: false
      });
      setFollowupForm({
        contact_id: "",
        followup_date: "",
        comments: "",
        next_followup_date: ""
      });
    } catch (error) {
      console.error("Failed to add followup:", error);
    }
  };

  const handleAddMeeting = async () => {
    if (!meetingForm.contact_id || !meetingForm.meeting_date) return;
    
    try {
      await addMeeting.mutateAsync({
        ...meetingForm,
        employee_id: selectedEmployee === "all" ? myEmployee?.id || "" : selectedEmployee,
        duration_minutes: meetingForm.duration_minutes ? parseInt(meetingForm.duration_minutes) : undefined
      });
      setMeetingForm({
        contact_id: "",
        meeting_date: "",
        meeting_type: "in_person",
        duration_minutes: "",
        outcome: "",
        notes: "",
        next_steps: "",
        follow_up_required: false,
        follow_up_date: ""
      });
    } catch (error) {
      console.error("Failed to add meeting:", error);
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.contact_id || !accountForm.account_opening_date) return;
    
    try {
      await addAccount.mutateAsync({
        ...accountForm,
        employee_id: selectedEmployee === "all" ? myEmployee?.id || "" : selectedEmployee,
        initial_margin: parseFloat(accountForm.initial_margin) || 0,
        current_margin: parseFloat(accountForm.current_margin) || 0,
        margin_history: [],
        account_status: "active"
      });
      setAccountForm({
        contact_id: "",
        account_opening_date: "",
        account_number: "",
        initial_margin: "",
        current_margin: "",
        notes: ""
      });
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render contact details modal
  const renderContactDetails = (contact: Contact) => {
    const contactFollowups = followups.filter(f => f.contact_id === contact.id);
    const contactMeetings = meetings.filter(m => m.contact_id === contact.id);
    const contactAccount = accounts.find(a => a.contact_id === contact.id);

    return (
      <Dialog open={showContactDetails === contact.id} onOpenChange={() => setShowContactDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{contact.name}</span>
              <Badge className={getCategoryBadge(contact.category).className}>
                {getCategoryBadge(contact.category).label}
              </Badge>
            </DialogTitle>
            <DialogDescription>Contact details and interaction history</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                )}
                {contact.position && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.position}</span>
                  </div>
                )}
                {contact.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            {contactAccount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Account Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Account Number</Label>
                    <p className="text-sm">{contactAccount.account_number || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Opening Date</Label>
                    <p className="text-sm">{formatDate(contactAccount.account_opening_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Margin</Label>
                    <p className="text-sm font-bold text-green-600">
                      PKR {contactAccount.current_margin?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={contactAccount.account_status === 'active' ? 'default' : 'secondary'}>
                      {contactAccount.account_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Followups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Followups ({contactFollowups.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {contactFollowups.map((followup) => (
                  <div key={followup.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatDateTime(followup.followup_date)}
                      </span>
                      {followup.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {followup.comments && (
                      <p className="text-sm text-muted-foreground mt-1">{followup.comments}</p>
                    )}
                    {followup.next_followup_date && (
                      <p className="text-xs text-blue-600 mt-1">
                        Next: {formatDateTime(followup.next_followup_date)}
                      </p>
                    )}
                  </div>
                ))}
                {contactFollowups.length === 0 && (
                  <p className="text-sm text-muted-foreground">No followups recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Meetings ({contactMeetings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {contactMeetings.map((meeting) => (
                  <div key={meeting.id} className="border-l-4 border-green-200 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatDateTime(meeting.meeting_date)}
                      </span>
                      <Badge variant="outline">{meeting.meeting_type}</Badge>
                    </div>
                    {meeting.outcome && (
                      <p className="text-sm text-muted-foreground mt-1">{meeting.outcome}</p>
                    )}
                    {meeting.next_steps && (
                      <p className="text-xs text-green-600 mt-1">
                        Next Steps: {meeting.next_steps}
                      </p>
                    )}
                  </div>
                ))}
                {contactMeetings.length === 0 && (
                  <p className="text-sm text-muted-foreground">No meetings recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your contacts, followups, meetings, and client accounts
          </p>
        </div>

        {/* Employee Filter */}
        {isAdmin && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Followups</p>
                  <p className="text-2xl font-bold">{upcomingFollowups.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Meetings</p>
                  <p className="text-2xl font-bold">{meetings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                  <p className="text-2xl font-bold">{accounts.filter(a => a.account_status === 'active').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tab.Group>
          <div className="w-full flex justify-center mb-8">
            <Tab.List className="inline-flex bg-muted p-2 rounded-xl shadow-sm border border-border gap-2">
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-6 py-2 rounded-lg font-semibold transition focus:outline-none",
                    selected
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-card text-primary hover:bg-muted"
                  )
                }
              >
                Contacts
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-6 py-2 rounded-lg font-semibold transition focus:outline-none",
                    selected
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-card text-primary hover:bg-muted"
                  )
                }
              >
                Followups
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-6 py-2 rounded-lg font-semibold transition focus:outline-none",
                    selected
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-card text-primary hover:bg-muted"
                  )
                }
              >
                Meetings
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-6 py-2 rounded-lg font-semibold transition focus:outline-none",
                    selected
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-card text-primary hover:bg-muted"
                  )
                }
              >
                Accounts
              </Tab>
            </Tab.List>
          </div>

          <Tab.Panels>
            {/* Contacts Tab */}
            <Tab.Panel>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Contacts Management</span>
                      </CardTitle>
                      <CardDescription>Manage your prospect and client contacts</CardDescription>
                    </div>
                    <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Contact</DialogTitle>
                          <DialogDescription>Add a new prospect or client to your CRM</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Contact name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="contact@example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+92 300 1234567"
                            />
                          </div>
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={contactForm.company}
                              onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="position">Position</Label>
                            <Input
                              id="position"
                              value={contactForm.position}
                              onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
                              placeholder="Job title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={contactForm.category} onValueChange={(value: Contact['category']) => setContactForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryOptions.slice(1).map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="source">Source</Label>
                            <Input
                              id="source"
                              value={contactForm.source}
                              onChange={(e) => setContactForm(prev => ({ ...prev, source: e.target.value }))}
                              placeholder="How did you find this contact?"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={contactForm.notes}
                              onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes about this contact"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setShowAddContact(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddContact} disabled={addContact.isPending}>
                            {addContact.isPending ? "Adding..." : "Add Contact"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Category Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Filter by Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedCategory === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(option.value)}
                        >
                          {option.label}
                          {option.value !== "all" && (
                            <Badge variant="secondary" className="ml-2">
                              {contacts.filter(c => c.category === option.value).length}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map((contact) => (
                      <Card key={contact.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              {contact.company && (
                                <p className="text-sm text-muted-foreground">{contact.company}</p>
                              )}
                            </div>
                            <Badge className={getCategoryBadge(contact.category).className}>
                              {getCategoryBadge(contact.category).label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {contact.email && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Added {formatDate(contact.created_at)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowContactDetails(contact.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                        {renderContactDetails(contact)}
                      </Card>
                    ))}
                  </div>
                  
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No contacts found in this category</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tab.Panel>

            {/* Followups Tab */}
            <Tab.Panel>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Followups Management</span>
                      </CardTitle>
                      <CardDescription>Schedule and track followups with your contacts</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Followup
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Followup</DialogTitle>
                          <DialogDescription>Schedule a followup with a contact</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="followup-contact">Contact</Label>
                            <Select value={followupForm.contact_id} onValueChange={(value) => setFollowupForm(prev => ({ ...prev, contact_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                              <SelectContent>
                                {contacts.map((contact) => (
                                  <SelectItem key={contact.id} value={contact.id}>
                                    {contact.name} - {contact.company || 'No company'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="followup-date">Followup Date & Time</Label>
                            <Input
                              id="followup-date"
                              type="datetime-local"
                              value={followupForm.followup_date}
                              onChange={(e) => setFollowupForm(prev => ({ ...prev, followup_date: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="followup-comments">Comments</Label>
                            <Textarea
                              id="followup-comments"
                              value={followupForm.comments}
                              onChange={(e) => setFollowupForm(prev => ({ ...prev, comments: e.target.value }))}
                              placeholder="What needs to be discussed?"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="next-followup-date">Next Followup Date (Optional)</Label>
                            <Input
                              id="next-followup-date"
                              type="datetime-local"
                              value={followupForm.next_followup_date}
                              onChange={(e) => setFollowupForm(prev => ({ ...prev, next_followup_date: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleAddFollowup} disabled={addFollowup.isPending}>
                            {addFollowup.isPending ? "Scheduling..." : "Schedule Followup"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Upcoming Followups */}
                  {upcomingFollowups.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-yellow-600">
                        Upcoming Followups (Next 7 Days)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingFollowups.map((followup) => (
                          <Card key={followup.id} className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{followup.contacts?.name}</h4>
                                <Clock className="h-4 w-4 text-yellow-500" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {formatDateTime(followup.next_followup_date!)}
                              </p>
                              {followup.comments && (
                                <p className="text-sm">{followup.comments}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Followups */}
                  <div className="space-y-4">
                    {followups.map((followup) => (
                      <Card key={followup.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{followup.contacts?.name}</h4>
                                {followup.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Scheduled: {formatDateTime(followup.followup_date)}
                              </p>
                              {followup.next_followup_date && (
                                <p className="text-sm text-blue-600 mb-1">
                                  Next: {formatDateTime(followup.next_followup_date)}
                                </p>
                              )}
                              {followup.comments && (
                                <p className="text-sm mt-2">{followup.comments}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {!followup.completed && (
                                <Button
                                  size="sm"
                                  onClick={() => updateFollowup.mutate({ id: followup.id, completed: true })}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {followups.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No followups scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tab.Panel>

            {/* Meetings Tab */}
            <Tab.Panel>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Meetings Management</span>
                      </CardTitle>
                      <CardDescription>Record and track meetings with your contacts</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Meeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Meeting</DialogTitle>
                          <DialogDescription>Record details of a meeting with a contact</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="meeting-contact">Contact</Label>
                            <Select value={meetingForm.contact_id} onValueChange={(value) => setMeetingForm(prev => ({ ...prev, contact_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                              <SelectContent>
                                {contacts.map((contact) => (
                                  <SelectItem key={contact.id} value={contact.id}>
                                    {contact.name} - {contact.company || 'No company'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="meeting-date">Meeting Date & Time</Label>
                              <Input
                                id="meeting-date"
                                type="datetime-local"
                                value={meetingForm.meeting_date}
                                onChange={(e) => setMeetingForm(prev => ({ ...prev, meeting_date: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="meeting-type">Meeting Type</Label>
                              <Select value={meetingForm.meeting_type} onValueChange={(value: ContactMeeting['meeting_type']) => setMeetingForm(prev => ({ ...prev, meeting_type: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_person">In Person</SelectItem>
                                  <SelectItem value="video_call">Video Call</SelectItem>
                                  <SelectItem value="phone_call">Phone Call</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={meetingForm.duration_minutes}
                              onChange={(e) => setMeetingForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                              placeholder="60"
                            />
                          </div>
                          <div>
                            <Label htmlFor="outcome">Meeting Outcome</Label>
                            <Textarea
                              id="outcome"
                              value={meetingForm.outcome}
                              onChange={(e) => setMeetingForm(prev => ({ ...prev, outcome: e.target.value }))}
                              placeholder="What was the result of this meeting?"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="meeting-notes">Notes</Label>
                            <Textarea
                              id="meeting-notes"
                              value={meetingForm.notes}
                              onChange={(e) => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes about the meeting"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="next-steps">Next Steps</Label>
                            <Textarea
                              id="next-steps"
                              value={meetingForm.next_steps}
                              onChange={(e) => setMeetingForm(prev => ({ ...prev, next_steps: e.target.value }))}
                              placeholder="What are the next steps?"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleAddMeeting} disabled={addMeeting.isPending}>
                            {addMeeting.isPending ? "Recording..." : "Record Meeting"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{meeting.contacts?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(meeting.meeting_date)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{meeting.meeting_type}</Badge>
                              {meeting.duration_minutes && (
                                <Badge variant="secondary">{meeting.duration_minutes}min</Badge>
                              )}
                            </div>
                          </div>
                          
                          {meeting.outcome && (
                            <div className="mb-2">
                              <Label className="text-sm font-medium">Outcome</Label>
                              <p className="text-sm mt-1">{meeting.outcome}</p>
                            </div>
                          )}
                          
                          {meeting.next_steps && (
                            <div className="mb-2">
                              <Label className="text-sm font-medium">Next Steps</Label>
                              <p className="text-sm mt-1 text-blue-600">{meeting.next_steps}</p>
                            </div>
                          )}
                          
                          {meeting.notes && (
                            <div>
                              <Label className="text-sm font-medium">Notes</Label>
                              <p className="text-sm mt-1 text-muted-foreground">{meeting.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {meetings.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No meetings recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tab.Panel>

            {/* Accounts Tab */}
            <Tab.Panel>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Client Accounts</span>
                      </CardTitle>
                      <CardDescription>Manage client accounts and margin information</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Client Account</DialogTitle>
                          <DialogDescription>Record account opening details for a client</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="account-contact">Contact</Label>
                            <Select value={accountForm.contact_id} onValueChange={(value) => setAccountForm(prev => ({ ...prev, contact_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                              <SelectContent>
                                {contacts.filter(c => c.category === 'account_opened' || c.category === 'meeting_done').map((contact) => (
                                  <SelectItem key={contact.id} value={contact.id}>
                                    {contact.name} - {contact.company || 'No company'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="opening-date">Account Opening Date</Label>
                              <Input
                                id="opening-date"
                                type="date"
                                value={accountForm.account_opening_date}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, account_opening_date: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="account-number">Account Number</Label>
                              <Input
                                id="account-number"
                                value={accountForm.account_number}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, account_number: e.target.value }))}
                                placeholder="ACC-12345"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="initial-margin">Initial Margin (PKR)</Label>
                              <Input
                                id="initial-margin"
                                type="number"
                                value={accountForm.initial_margin}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, initial_margin: e.target.value }))}
                                placeholder="100000"
                              />
                            </div>
                            <div>
                              <Label htmlFor="current-margin">Current Margin (PKR)</Label>
                              <Input
                                id="current-margin"
                                type="number"
                                value={accountForm.current_margin}
                                onChange={(e) => setAccountForm(prev => ({ ...prev, current_margin: e.target.value }))}
                                placeholder="150000"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="account-notes">Notes</Label>
                            <Textarea
                              id="account-notes"
                              value={accountForm.notes}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes about this account"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleAddAccount} disabled={addAccount.isPending}>
                            {addAccount.isPending ? "Creating..." : "Create Account"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                      <Card key={account.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{account.contacts?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {account.account_number || 'No account number'}
                              </p>
                            </div>
                            <Badge variant={account.account_status === 'active' ? 'default' : 'secondary'}>
                              {account.account_status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Opening Date:</span>
                              <span>{formatDate(account.account_opening_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Initial Margin:</span>
                              <span className="font-medium">PKR {account.initial_margin?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Current Margin:</span>
                              <span className="font-bold text-green-600">
                                PKR {account.current_margin?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {account.notes && (
                            <p className="text-xs text-muted-foreground border-t pt-2">
                              {account.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {accounts.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No client accounts created</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
};

export default CRM;