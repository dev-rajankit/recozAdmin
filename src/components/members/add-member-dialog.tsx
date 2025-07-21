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
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [seatingHours, setSeatingHours] = useState("");
  const [feesPaid, setFeesPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>();

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDueDate(member.dueDate);
      setSeatingHours(member.seatingHours.toString());
      setFeesPaid(member.feesPaid.toString());
      setPaymentDate(member.paymentDate);
    } else {
      setName("");
      setDueDate(undefined);
      setSeatingHours("");
      setFeesPaid("");
      setPaymentDate(undefined);
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dueDate || !seatingHours || !feesPaid || !paymentDate) {
      alert("Please fill all fields");
      return;
    }

    const memberData = {
      name,
      dueDate,
      seatingHours: parseInt(seatingHours, 10),
      feesPaid: parseInt(feesPaid, 10),
      paymentDate,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update the details for this member." : "Fill in the details for the new member."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">{member ? "Save Changes" : "Add Member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
