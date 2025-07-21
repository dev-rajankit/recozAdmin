"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MembersTable } from "./members-table";
import { AddMemberDialog } from "./add-member-dialog";
import { Member, MemberStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MembersView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const getStatus = (dueDate: Date): MemberStatus => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    if (due < now) return 'Expired';
    if (due <= sevenDaysFromNow) return 'Expiring Soon';
    return 'Active';
  };


  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch members');
      
      const membersWithStatus = data.map((member: any) => ({
        ...member,
        status: getStatus(new Date(member.dueDate)),
        dueDate: new Date(member.dueDate),
        paymentDate: new Date(member.paymentDate)
      }));
      setMembers(membersWithStatus);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'status' | 'avatarUrl'>) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add member');
      toast({ title: 'Success', description: 'Member added successfully.' });
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  const handleUpdateMember = async (updatedMember: Member) => {
     try {
      const response = await fetch(`/api/members/${updatedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update member');
      toast({ title: 'Success', description: 'Member updated successfully.' });
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if(!memberToDelete) return;
    try {
      const response = await fetch(`/api/members/${memberToDelete}`, {
        method: 'DELETE',
      });
       const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete member');
      toast({ title: 'Success', description: 'Member deleted successfully.' });
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setMemberToDelete(null);
    }
  };
  
  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  }

  const openAddDialog = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  }

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const getMembersByStatus = (status: MemberStatus) => {
    return filteredMembers.filter((member) => member.status === status);
  };

  const getExpiringSoonMembers = () => {
    return filteredMembers.filter(member => member.status === 'Expiring Soon');
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <MembersTable members={filteredMembers} onEdit={openEditDialog} onDelete={setMemberToDelete} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <MembersTable members={getMembersByStatus("Active")} onEdit={openEditDialog} onDelete={setMemberToDelete} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="expiring" className="mt-4">
            <MembersTable members={getExpiringSoonMembers()} onEdit={openEditDialog} onDelete={setMemberToDelete} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="expired" className="mt-4">
            <MembersTable members={getMembersByStatus("Expired")} onEdit={openEditDialog} onDelete={setMemberToDelete} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
        
        <AddMemberDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          member={editingMember}
        />
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this member's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
