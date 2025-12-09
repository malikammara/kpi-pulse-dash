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
    { id: "emp-1", name: "Aisha Khan", email: "aisha.khan@example.com", created_at: new Date().toISOString() },
    { id: "emp-2", name: "Bilal Ahmed", email: "bilal.ahmed@example.com", created_at: new Date().toISOString() },
  ],
  adminEmails: ["aisha.khan@example.com"],
  contacts: [],
  contactFollowups: [],
  contactMeetings: [],
  contactAccounts: [],
  kpiData: [
    {
      id: "kpi-1",
      employee_id: "emp-1",
      date: new Date().toISOString().split("T")[0],
      margin: 1500000,
      calls: 40,
      leads_generated: 25,
      solo_closing: 5,
      out_house_meetings: 1,
      in_house_meetings: 1,
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

