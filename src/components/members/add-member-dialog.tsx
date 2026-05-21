
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
import { Switch } from "@/components/ui/switch";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import type { Member } from "@/types";

interface AddMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddMember: (member: Omit<Member, 'id' | 'status'>) => void;
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
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleDateChange = (value: string, setter: (d: Date | undefined) => void) => {
    if (!value) {
      setter(undefined);
      return;
    }
    const [year, month, day] = value.split("-").map(Number);
    setter(new Date(year, month - 1, day));
  };

  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setPhone(member.phone || "");
      setAadharNumber(member.aadharNumber || "");
      setDueDate(member.dueDate ? new Date(member.dueDate) : undefined);
      setSeatingHours(member.seatingHours?.toString() || "");
      setFeesPaid(member.feesPaid?.toString() || "");
      setPaymentDate(member.paymentDate ? new Date(member.paymentDate) : undefined);
      setSeatNumber(member.seatNumber || "");
      setIsSeatReserved(member.isSeatReserved || false);
      setAvatarUrl(member.avatarUrl || "");
    } else {
      // Reset for new member
      setName("");
      setPhone("");
      setAadharNumber("");
      setDueDate(undefined);
      setSeatingHours("");
      setFeesPaid("");
      setPaymentDate(undefined);
      setSeatNumber("");
      setIsSeatReserved(false);
      setAvatarUrl("");
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
      avatarUrl: avatarUrl || `https://placehold.co/40x40.png`,
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
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                className="col-span-3" 
                placeholder="10-digit number"
                required 
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input 
                  id="avatarUrl" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  className="flex-1" 
                  placeholder="https://example.com/photo.png" 
                />
                {(avatarUrl || member?.avatarUrl) && (
                  <div className="h-9 w-9 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                    <img 
                      src={avatarUrl || member?.avatarUrl || `https://placehold.co/40x40.png`} 
                      alt="Avatar" 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/40x40.png`;
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aadhar" className="text-right">Aadhar No.</Label>
              <Input 
                id="aadhar" 
                value={aadharNumber} 
                onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} 
                className="col-span-3" 
                placeholder="Optional 12-digit number" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seatNumber" className="text-right">Seat No.</Label>
              <Input 
                id="seatNumber" 
                value={seatNumber} 
                onChange={(e) => setSeatNumber(e.target.value.toUpperCase())} 
                className="col-span-3" 
                placeholder="e.g., R32" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isSeatReserved" className="text-right">Reserved</Label>
                <Switch id="isSeatReserved" checked={isSeatReserved} onCheckedChange={setIsSeatReserved} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => handleDateChange(e.target.value, setDueDate)}
                  required
                />
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDueDate(addMonths(dueDate || new Date(), 1))}
                    className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60"
                  >
                    +1 Month
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDueDate(addMonths(dueDate || new Date(), 3))}
                    className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60"
                  >
                    +3 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDueDate(new Date())}
                    className="text-xs h-7 px-2 hover:bg-muted text-muted-foreground"
                  >
                    Today
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seatingHours" className="text-right">Seating Hours</Label>
              <Input id="seatingHours" type="number" min="0" value={seatingHours} onChange={(e) => setSeatingHours(Math.max(0, parseInt(e.target.value, 10) || 0).toString())} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feesPaid" className="text-right">Fees Paid (₹)</Label>
              <Input id="feesPaid" type="number" min="0" value={feesPaid} onChange={(e) => setFeesPaid(Math.max(0, parseInt(e.target.value, 10) || 0).toString())} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">Payment Date</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate ? format(paymentDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => handleDateChange(e.target.value, setPaymentDate)}
                  required
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentDate(new Date())}
                    className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60"
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (dueDate) setPaymentDate(dueDate);
                    }}
                    disabled={!dueDate}
                    className="text-xs h-7 px-2 hover:bg-muted text-muted-foreground disabled:opacity-50"
                  >
                    Match Due Date
                  </Button>
                </div>
              </div>
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
