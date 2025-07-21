
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Member, MemberStatus } from "@/types";
import { format } from "date-fns";
import { Pencil, MessageSquare, Phone, CheckCircle, XCircle } from "lucide-react";

interface MemberDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  member: Member | null;
  onEdit: (member: Member) => void;
}

const statusVariant: Record<MemberStatus, "default" | "secondary" | "destructive"> = {
  Active: "default",
  "Expiring Soon": "secondary",
  Expired: "destructive",
};

const statusColor: Record<MemberStatus, string> = {
  Active: "bg-green-500 hover:bg-green-600",
  "Expiring Soon": "bg-yellow-500 hover:bg-yellow-600",
  Expired: "bg-red-500 hover:bg-red-600",
}

export function MemberDetailsDialog({ isOpen, setIsOpen, member, onEdit }: MemberDetailsDialogProps) {
  if (!member) return null;

  const handleEdit = () => {
    setIsOpen(false);
    onEdit(member);
  }

  const getWhatsAppLink = () => {
    if (!member || !member.phone) return "";
    const phoneNumber = member.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const formattedDueDate = format(new Date(member.dueDate), "MMMM dd, yyyy");
    
    const message = `Dear Member,

We hope you're enjoying the services at Recoz Library. This is a courteous reminder that your membership is due to expire on ${formattedDueDate}.

To ensure uninterrupted access to our facilities, kindly renew your membership at your earliest convenience. For your ease, you can make an instant online payment to our UPI ID: 9625670851@ptaxis`;

    const encodedMessage = encodeURIComponent(message);
    // Assuming Indian phone numbers, add 91 if not present
    const fullPhoneNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    return `https://wa.me/${fullPhoneNumber}?text=${encodedMessage}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            Full information for {member.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person avatar"/>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={statusVariant[member.status]} className={`capitalize ${statusColor[member.status]}`}>
                      {member.status}
                    </Badge>
                </div>
                 <div>
                    <p className="text-muted-foreground">Aadhar Number</p>
                    <p>{member.aadharNumber || "N/A"}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Seat Number</p>
                    <p>{member.seatNumber || "N/A"}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Seat Reserved</p>
                     <div className="flex items-center gap-1">
                       {member.isSeatReserved ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                       <span>{member.isSeatReserved ? "Yes" : "No"}</span>
                    </div>
                </div>
                 <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p>{format(new Date(member.dueDate), "MMM dd, yyyy")}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Seating Hours</p>
                    <p>{member.seatingHours} hrs</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Last Payment Date</p>
                    <p>{format(new Date(member.paymentDate), "MMM dd, yyyy")}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Last Fees Paid</p>
                    <p>₹{member.feesPaid.toLocaleString("en-IN")}</p>
                </div>
            </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" asChild>
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                </Button>
                 <Button variant="outline" size="sm" onClick={() => alert('Calling feature coming soon!')}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4"/>
                  Edit
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
