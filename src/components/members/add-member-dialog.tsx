"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Member } from "@/types";

interface AddMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddMember: (member: Omit<Member, 'id' | 'status' | 'avatarUrl'>) => void;
  onUpdateMember: (member: Member) => void;
  member: Member | null;
}

export function AddMemberDialog({ isOpen, setIsOpen, onAddMember, onUpdateMember, member }: AddMemberDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [seatingHours, setSeatingHours] = useState("");
  const [feesPaid, setFeesPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>();
  const [seatNumber, setSeatNumber] = useState("");
  const [isSeatReserved, setIsSeatReserved] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setAadharNumber(member.aadharNumber || "");
      setDueDate(member.dueDate);
      setSeatingHours(member.seatingHours.toString());
      setFeesPaid(member.feesPaid.toString());
      setPaymentDate(member.paymentDate);
      setSeatNumber(member.seatNumber || "");
      setIsSeatReserved(member.isSeatReserved || false);
    } else {
      setName("");
      setPhone("");
      setAadharNumber("");
      setDueDate(undefined);
      setSeatingHours("");
      setFeesPaid("");
      setPaymentDate(undefined);
      setSeatNumber("");
      setIsSeatReserved(false);
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !dueDate || !seatingHours || !feesPaid || !paymentDate) {
      alert("Please fill all required fields");
      return;
    }

    const memberData = {
      name,
      phone,
      aadharNumber,
      dueDate,
      seatingHours: parseInt(seatingHours, 10),
      feesPaid: parseInt(feesPaid, 10),
      paymentDate,
      seatNumber,
      isSeatReserved,
    };

    if (member) {
      onUpdateMember({ ...member, ...memberData });
    } else {
      onAddMember(memberData);
    }
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update the details for this member." : "Fill in the details for the new member."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aadhar" className="text-right">Aadhar No.</Label>
              <Input id="aadhar" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} className="col-span-3" placeholder="Optional" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seatNumber" className="text-right">Seat No.</Label>
              <Input id="seatNumber" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} className="col-span-3" placeholder="e.g., R32" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isSeatReserved" className="text-right">Reserved</Label>
                <Switch id="isSeatReserved" checked={isSeatReserved} onCheckedChange={setIsSeatReserved} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seatingHours" className="text-right">Seating Hours</Label>
              <Input id="seatingHours" type="number" value={seatingHours} onChange={(e) => setSeatingHours(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feesPaid" className="text-right">Fees Paid (₹)</Label>
              <Input id="feesPaid" type="number" value={feesPaid} onChange={(e) => setFeesPaid(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                  </PopoverContent>
                </Popover>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">{member ? "Save Changes" : "Add Member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
