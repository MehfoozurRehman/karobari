"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPaisa } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/dates";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function EmployeesPage() {
  const { isAuthenticated } = useConvexAuth();
  const employees = useQuery(api.employees.list, isAuthenticated ? {} : "skip");
  const entries = useQuery(
    api.employees.salaryEntries,
    isAuthenticated ? {} : "skip",
  );
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const addEntry = useMutation(api.employees.addSalaryEntry);

  const [empOpen, setEmpOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [payEmployee, setPayEmployee] = useState<string>("");
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState<string>("salary");
  const [payNote, setPayNote] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Employees & Salaries
          </h1>
          <p className="text-sm text-stone-500">
            Track staff, monthly pay, advances, and bonuses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full border-emerald-200 text-emerald-700"
            onClick={() => setPayOpen(true)}
          >
            Record Payment
          </Button>
          <Dialog open={payOpen} onOpenChange={setPayOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Salary Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select value={payEmployee} onValueChange={(v) => setPayEmployee(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((e) => (
                        <SelectItem key={e._id} value={e._id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Amount (Rs.)</Label>
                    <Input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={payType} onValueChange={(v) => setPayType(v ?? "salary")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["salary", "advance", "bonus", "deduction"].map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Input
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                  onClick={async () => {
                    if (!payEmployee || !payAmount) {
                      toast.error("Employee aur amount select karein");
                      return;
                    }
                    await addEntry({
                      employeeId: payEmployee as Id<"employees">,
                      amountRupees: Number(payAmount),
                      type: payType as "salary" | "advance" | "bonus" | "deduction",
                      note: payNote || undefined,
                    });
                    toast.success("Payment recorded");
                    setPayOpen(false);
                    setPayAmount("");
                    setPayNote("");
                  }}
                >
                  Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
            onClick={() => setEmpOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
          <Dialog open={empOpen} onOpenChange={setEmpOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03xx xxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role (optional)</Label>
                    <Input
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Waiter"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Salary (Rs.)</Label>
                  <Input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="30000"
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                  onClick={async () => {
                    if (!name || !salary) {
                      toast.error("Name aur salary zaroori hai");
                      return;
                    }
                    await createEmployee({
                      name,
                      phone: phone || undefined,
                      roleTitle: roleTitle || undefined,
                      monthlySalaryRupees: Number(salary),
                    });
                    toast.success("Employee added");
                    setEmpOpen(false);
                    setName("");
                    setPhone("");
                    setRoleTitle("");
                    setSalary("");
                  }}
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {employees?.map((e) => (
          <Card key={e._id} className="rounded-2xl border-stone-200">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900">{e.name}</p>
                <button
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    e.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-500"
                  }`}
                  onClick={() =>
                    updateEmployee({ employeeId: e._id, active: !e.active })
                  }
                >
                  {e.active ? "Active" : "Inactive"}
                </button>
              </div>
              <p className="text-xs text-stone-500">
                {e.roleTitle ?? "Staff"} {e.phone ? `· ${e.phone}` : ""}
              </p>
              <p className="text-sm font-semibold text-emerald-700">
                {formatPaisa(e.monthlySalaryPaisa)} / month
              </p>
            </CardContent>
          </Card>
        ))}
        {employees?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-stone-200 bg-white py-12 text-center text-sm text-stone-500">
            No employees added yet.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">
          This Month&apos;s Payments
        </h2>
        {entries?.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white py-10 text-center text-sm text-stone-500">
            No salary payments recorded this month.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {entries?.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between border-b border-stone-100 px-5 py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-semibold text-stone-900">
                    {entry.employeeName}
                  </p>
                  <p className="text-xs capitalize text-stone-500">
                    {entry.type}
                    {entry.note ? ` · ${entry.note}` : ""} ·{" "}
                    {formatDate(entry.paidAt)}
                  </p>
                </div>
                <p
                  className={`font-bold ${entry.type === "deduction" ? "text-red-600" : "text-stone-900"}`}
                >
                  {entry.type === "deduction" ? "-" : ""}
                  {formatPaisa(entry.amountPaisa)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
