import { nanoid } from "nanoid";
import {
  Contact,
  ContactAccount,
  ContactFollowup,
  ContactMeeting,
  Employee,
  KPIData,
  KPIMonthlyRow,
} from "@/lib/types";

const STORAGE_KEY = "kpi-demo-store";

const isoDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

interface DemoState {
  employees: Employee[];
  adminEmails: string[];
  contacts: Contact[];
  contactFollowups: ContactFollowup[];
  contactMeetings: ContactMeeting[];
  contactAccounts: ContactAccount[];
  kpiData: KPIData[];
}

const defaultState: DemoState = {
  employees: [
    { id: "emp-1", name: "Aisha Khan", email: "aisha.khan@example.com", created_at: isoDate() },
    { id: "emp-2", name: "Bilal Sheikh", email: "bilal.sheikh@example.com", created_at: isoDate(-12) },
    { id: "emp-3", name: "Maria Ahmed", email: "maria.ahmed@example.com", created_at: isoDate(-30) },
    { id: "emp-4", name: "Sunil Kumar", email: "sunil.kumar@example.com", created_at: isoDate(-45) },
  ],
  adminEmails: ["aisha.khan@example.com", "maria.ahmed@example.com"],
  contacts: [
    {
      id: "contact-1",
      employee_id: "emp-1",
      name: "Zara Textiles",
      email: "info@zaratextiles.pk",
      phone: "+92 300 1112233",
      company: "Zara Textiles",
      position: "Procurement Director",
      category: "in_followup",
      notes: "Requested pricing for Q3 bulk order.",
      source: "Inbound call",
      created_at: isoDate(-5),
      updated_at: isoDate(-2),
      employees: { name: "Aisha Khan", email: "aisha.khan@example.com" },
    },
    {
      id: "contact-2",
      employee_id: "emp-2",
      name: "Bluefin Capital",
      email: "hello@bluefin.cap",
      phone: "+92 345 5556677",
      company: "Bluefin Capital",
      position: "VP Finance",
      category: "meeting_done",
      notes: "Considering premium package; wants 48 hour support SLA.",
      source: "Outbound",
      created_at: isoDate(-9),
      updated_at: isoDate(-1),
      employees: { name: "Bilal Sheikh", email: "bilal.sheikh@example.com" },
    },
    {
      id: "contact-3",
      employee_id: "emp-3",
      name: "Civic Builders",
      email: "projects@civicbuilders.com",
      phone: "+92 321 8889900",
      company: "Civic Builders",
      position: "Head of Projects",
      category: "sent_details",
      notes: "Sent case studies and onboarding checklist.",
      source: "Event booth",
      created_at: isoDate(-14),
      updated_at: isoDate(-3),
      employees: { name: "Maria Ahmed", email: "maria.ahmed@example.com" },
    },
    {
      id: "contact-4",
      employee_id: "emp-4",
      name: "Dawn Logistics",
      email: "ops@dawnlogistics.pk",
      phone: "+92 333 4445566",
      company: "Dawn Logistics",
      position: "Operations Manager",
      category: "interested",
      notes: "Prefers hybrid onboarding with monthly check-ins.",
      source: "Referral",
      created_at: isoDate(-20),
      updated_at: isoDate(-8),
      employees: { name: "Sunil Kumar", email: "sunil.kumar@example.com" },
    },
  ],
  contactFollowups: [
    {
      id: "followup-1",
      contact_id: "contact-1",
      employee_id: "emp-1",
      followup_date: isoDate(1),
      completed: false,
      comments: "Send revised pricing with bundled analytics.",
      next_followup_date: isoDate(4),
      notification_sent: true,
      created_at: isoDate(-5),
      updated_at: isoDate(),
      contacts: { name: "Zara Textiles" },
    },
    {
      id: "followup-2",
      contact_id: "contact-3",
      employee_id: "emp-3",
      followup_date: isoDate(-1),
      completed: true,
      comments: "Shared onboarding deck and ROI calculator.",
      next_followup_date: isoDate(6),
      notification_sent: true,
      created_at: isoDate(-12),
      updated_at: isoDate(-1),
      contacts: { name: "Civic Builders" },
    },
    {
      id: "followup-3",
      contact_id: "contact-2",
      employee_id: "emp-2",
      followup_date: isoDate(2),
      completed: false,
      comments: "Awaiting legal clearance on contract draft.",
      next_followup_date: isoDate(9),
      notification_sent: false,
      created_at: isoDate(-9),
      updated_at: isoDate(-1),
      contacts: { name: "Bluefin Capital" },
    },
  ],
  contactMeetings: [
    {
      id: "meeting-1",
      contact_id: "contact-2",
      employee_id: "emp-2",
      meeting_date: isoDate(-1),
      meeting_type: "video_call",
      duration_minutes: 45,
      outcome: "Walked through KPI dashboard; wants pilot.",
      notes: "Need pilot scope doc by Friday.",
      next_steps: "Send pilot SoW",
      follow_up_required: true,
      follow_up_date: isoDate(3),
      created_at: isoDate(-9),
      updated_at: isoDate(-1),
      contacts: { name: "Bluefin Capital" },
    },
    {
      id: "meeting-2",
      contact_id: "contact-4",
      employee_id: "emp-4",
      meeting_date: isoDate(-4),
      meeting_type: "in_person",
      duration_minutes: 30,
      outcome: "Demo delivered; interest in outbound playbooks.",
      notes: "Asked for SOP templates.",
      next_steps: "Share SOP pack and schedule training",
      follow_up_required: true,
      follow_up_date: isoDate(5),
      created_at: isoDate(-20),
      updated_at: isoDate(-4),
      contacts: { name: "Dawn Logistics" },
    },
    {
      id: "meeting-3",
      contact_id: "contact-1",
      employee_id: "emp-1",
      meeting_date: isoDate(-6),
      meeting_type: "phone_call",
      duration_minutes: 22,
      outcome: "Aligned on pricing bands.",
      notes: "Waiting on procurement sign-off.",
      next_steps: "Send financing options",
      follow_up_required: true,
      follow_up_date: isoDate(2),
      created_at: isoDate(-6),
      updated_at: isoDate(-2),
      contacts: { name: "Zara Textiles" },
    },
  ],
  contactAccounts: [
    {
      id: "account-1",
      contact_id: "contact-2",
      employee_id: "emp-2",
      account_opening_date: isoDate(-30),
      account_number: "BF-00912",
      initial_margin: 1200000,
      current_margin: 1850000,
      margin_history: [
        { date: isoDate(-30), value: 1200000 },
        { date: isoDate(-15), value: 1500000 },
        { date: isoDate(-7), value: 1700000 },
        { date: isoDate(), value: 1850000 },
      ],
      account_status: "active",
      notes: "Upgraded after first quarter.",
      created_at: isoDate(-30),
      updated_at: isoDate(),
      contacts: { name: "Bluefin Capital" },
    },
    {
      id: "account-2",
      contact_id: "contact-3",
      employee_id: "emp-3",
      account_opening_date: isoDate(-60),
      account_number: "CB-00441",
      initial_margin: 800000,
      current_margin: 950000,
      margin_history: [
        { date: isoDate(-60), value: 800000 },
        { date: isoDate(-45), value: 850000 },
        { date: isoDate(-20), value: 900000 },
        { date: isoDate(-5), value: 950000 },
      ],
      account_status: "active",
      notes: "Stable monthly cadence.",
      created_at: isoDate(-60),
      updated_at: isoDate(-5),
      contacts: { name: "Civic Builders" },
    },
  ],
  kpiData: [
    {
      id: "kpi-1",
      employee_id: "emp-1",
      date: isoDate().split("T")[0],
      margin: 1650000,
      calls: 48,
      leads_generated: 28,
      solo_closing: 6,
      out_house_meetings: 2,
      in_house_meetings: 2,
      product_knowledge: 4,
      smd: 4,
    },
    {
      id: "kpi-2",
      employee_id: "emp-2",
      date: isoDate(-2).split("T")[0],
      margin: 2100000,
      calls: 55,
      leads_generated: 31,
      solo_closing: 7,
      out_house_meetings: 2,
      in_house_meetings: 1,
      product_knowledge: 5,
      smd: 4,
    },
    {
      id: "kpi-3",
      employee_id: "emp-3",
      date: isoDate(-4).split("T")[0],
      margin: 950000,
      calls: 32,
      leads_generated: 18,
      solo_closing: 3,
      out_house_meetings: 1,
      in_house_meetings: 1,
      product_knowledge: 5,
      smd: 5,
    },
    {
      id: "kpi-4",
      employee_id: "emp-4",
      date: isoDate(-1).split("T")[0],
      margin: 2750000,
      calls: 62,
      leads_generated: 35,
      solo_closing: 8,
      out_house_meetings: 3,
      in_house_meetings: 2,
      product_knowledge: 4,
      smd: 4,
    },
  ],
};

const loadState = (): DemoState => {
  if (typeof localStorage === "undefined") return { ...defaultState };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as DemoState;
    return { ...defaultState, ...parsed };
  } catch (error) {
    console.error("Failed to load demo store", error);
    return { ...defaultState };
  }
};

let state: DemoState = loadState();

const persist = () => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist demo store", error);
  }
};

export const demoStore = {
  getEmployees: async () => state.employees,
  addEmployee: async ({ name, email }: { name: string; email: string }) => {
    const newEmployee: Employee = {
      id: nanoid(),
      name,
      email,
      created_at: new Date().toISOString(),
    };
    state = { ...state, employees: [...state.employees, newEmployee] };
    persist();
    return newEmployee;
  },
  getAdminEmails: async () => state.adminEmails,
  addAdminEmail: async (email: string) => {
    if (!state.adminEmails.includes(email)) {
      state = { ...state, adminEmails: [...state.adminEmails, email] };
      persist();
    }
    return email;
  },
  getKpiData: async () => state.kpiData,
  upsertKpiData: async (entry: Omit<KPIData, "id">) => {
    const existingIndex = state.kpiData.findIndex(
      (row) => row.employee_id === entry.employee_id && row.date === entry.date,
    );
    let updated: KPIData;
    if (existingIndex >= 0) {
      updated = { ...state.kpiData[existingIndex], ...entry, id: state.kpiData[existingIndex].id };
      const newData = [...state.kpiData];
      newData[existingIndex] = updated;
      state = { ...state, kpiData: newData };
    } else {
      updated = { ...entry, id: nanoid() };
      state = { ...state, kpiData: [...state.kpiData, updated] };
    }
    persist();
    return updated;
  },
  getContacts: async () => state.contacts,
  addContact: async (contact: Omit<Contact, "id" | "created_at" | "updated_at" | "employees">) => {
    const now = new Date().toISOString();
    const newContact: Contact = {
      ...contact,
      id: nanoid(),
      created_at: now,
      updated_at: now,
    };
    state = { ...state, contacts: [newContact, ...state.contacts] };
    persist();
    return newContact;
  },
  updateContact: async (id: string, updates: Partial<Contact>) => {
    const index = state.contacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Contact not found");
    const updated = { ...state.contacts[index], ...updates, updated_at: new Date().toISOString() };
    const updatedList = [...state.contacts];
    updatedList[index] = updated;
    state = { ...state, contacts: updatedList };
    persist();
    return updated;
  },
  getFollowups: async () => state.contactFollowups,
  addFollowup: async (
    followup: Omit<ContactFollowup, "id" | "created_at" | "updated_at" | "contacts">,
  ) => {
    const now = new Date().toISOString();
    const newFollowup: ContactFollowup = { ...followup, id: nanoid(), created_at: now, updated_at: now };
    state = { ...state, contactFollowups: [newFollowup, ...state.contactFollowups] };
    persist();
    return newFollowup;
  },
  updateFollowup: async (id: string, updates: Partial<ContactFollowup>) => {
    const index = state.contactFollowups.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Followup not found");
    const updated = {
      ...state.contactFollowups[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    const updatedList = [...state.contactFollowups];
    updatedList[index] = updated;
    state = { ...state, contactFollowups: updatedList };
    persist();
    return updated;
  },
  getMeetings: async () => state.contactMeetings,
  addMeeting: async (
    meeting: Omit<ContactMeeting, "id" | "created_at" | "updated_at" | "contacts">,
  ) => {
    const now = new Date().toISOString();
    const newMeeting: ContactMeeting = { ...meeting, id: nanoid(), created_at: now, updated_at: now };
    state = { ...state, contactMeetings: [newMeeting, ...state.contactMeetings] };
    persist();
    return newMeeting;
  },
  getAccounts: async () => state.contactAccounts,
  addAccount: async (
    account: Omit<ContactAccount, "id" | "created_at" | "updated_at" | "contacts">,
  ) => {
    const now = new Date().toISOString();
    const newAccount: ContactAccount = { ...account, id: nanoid(), created_at: now, updated_at: now };
    state = { ...state, contactAccounts: [newAccount, ...state.contactAccounts] };
    persist();
    return newAccount;
  },
  updateAccount: async (id: string, updates: Partial<ContactAccount>) => {
    const index = state.contactAccounts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Account not found");
    const updated = {
      ...state.contactAccounts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    const updatedList = [...state.contactAccounts];
    updatedList[index] = updated;
    state = { ...state, contactAccounts: updatedList };
    persist();
    return updated;
  },
  getMonthlyKPI: async (kpi: keyof KPIData, year: number, employeeId?: string): Promise<KPIMonthlyRow[]> => {
    const data = state.kpiData.filter((row) => {
      const date = new Date(row.date);
      return date.getFullYear() === year && (!employeeId || row.employee_id === employeeId);
    });

    const buckets: Record<string, number> = {};
    data.forEach((row) => {
      const date = new Date(row.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = (buckets[key] || 0) + (row[kpi] as number);
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month_key, value]) => {
        const [y, m] = month_key.split("-");
        const monthName = new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short" });
        return { month: `${monthName} ${y}`, month_key, value };
      });
  },
};

