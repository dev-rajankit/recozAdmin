"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member, MemberStatus } from "@/types";
import { format } from "date-fns";
import { MembersTableRowActions } from "./members-table-row-actions";

interface MembersTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
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

export function MembersTable({ members, onEdit, onDelete }: MembersTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Seating Hours</TableHead>
            <TableHead>Fees Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>{format(member.dueDate, "MMM dd, yyyy")}</TableCell>
                <TableCell>{member.seatingHours} hrs</TableCell>
                <TableCell>₹{member.feesPaid.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                   <Badge variant={statusVariant[member.status]} className={`capitalize ${statusColor[member.status]}`}>
                    {member.status}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <MembersTableRowActions member={member} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
