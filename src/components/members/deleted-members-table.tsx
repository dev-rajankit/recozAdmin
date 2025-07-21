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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member } from "@/types";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { RotateCcw, Trash2 } from "lucide-react";

interface DeletedMembersTableProps {
  members: Member[];
  onRestore: (memberId: string) => void;
  onPermanentDelete: (memberId: string) => void;
  isLoading: boolean;
}

export function DeletedMembersTable({ members, onRestore, onPermanentDelete, isLoading }: DeletedMembersTableProps) {
  return (
    <Card>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person avatar"/>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.deletedAt ? format(new Date(member.deletedAt), "MMM dd, yyyy") : 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                     <Button variant="outline" size="sm" onClick={() => onRestore(member.id)}>
                        <RotateCcw className="mr-2 h-4 w-4"/>
                        Restore
                    </Button>
                     <Button variant="destructive" size="sm" onClick={() => onPermanentDelete(member.id)}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete Permanently
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No deleted members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
