
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
} from "@/components/ui/alert-dialog";
import { DeletedMembersTable } from "./deleted-members-table";
import { MemberDetailsDialog } from "./member-details-dialog";

export function MembersView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<{id: string, permanent: boolean} | null>(null);
  const [memberToRestore, setMemberToRestore] = useState<string | null>(null);
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


  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeMembersRes, deletedMembersRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/members?includeDeleted=true')
      ]);

      if (!activeMembersRes.ok || !deletedMembersRes.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const activeMembersData = await activeMembersRes.json();
      const deletedMembersData = await deletedMembersRes.json();

      const membersWithStatus = activeMembersData.map((member: any) => ({
        ...member,
        status: getStatus(new Date(member.dueDate)),
        dueDate: new Date(member.dueDate),
        paymentDate: new Date(member.paymentDate)
      }));
       const deletedWithDates = deletedMembersData.map((member: any) => ({
        ...member,
        dueDate: new Date(member.dueDate),
        paymentDate: new Date(member.paymentDate),
        deletedAt: new Date(member.deletedAt)
      }));
      setMembers(membersWithStatus);
      setDeletedMembers(deletedWithDates);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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
      // If the currently viewed member is the one being updated, refresh the details dialog
      if(viewingMember?.id === updatedMember.id) {
        setViewingMember(updatedMember);
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if(!memberToDelete) return;
    const { id, permanent } = memberToDelete;
    const url = permanent ? `/api/members/${id}?permanent=true` : `/api/members/${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
       const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete member');
      toast({ title: 'Success', description: data.message });
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!memberToRestore) return;
    try {
      const response = await fetch(`/api/members/${memberToRestore}/restore`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to restore member');
      toast({ title: 'Success', description: 'Member restored successfully.' });
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setMemberToRestore(null);
    }
  };
  
  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setIsAddMemberDialogOpen(true);
  }

  const openAddDialog = () => {
    setEditingMember(null);
    setIsAddMemberDialogOpen(true);
  }

  const openDetailsDialog = (member: Member) => {
    setViewingMember(member);
    setIsDetailsDialogOpen(true);
  }

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredDeletedMembers = useMemo(() => {
    if (!deletedMembers) return [];
    return deletedMembers.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deletedMembers, searchQuery]);

  const getMembersByStatus = (status: MemberStatus) => {
    return filteredMembers.filter((member) => member.status === status);
  };

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
            <TabsTrigger value="deleted">Deleted</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <MembersTable members={filteredMembers} onEdit={openEditDialog} onDelete={(id) => setMemberToDelete({id, permanent: false})} onViewDetails={openDetailsDialog} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <MembersTable members={getMembersByStatus("Active")} onEdit={openEditDialog} onDelete={(id) => setMemberToDelete({id, permanent: false})} onViewDetails={openDetailsDialog} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="expiring" className="mt-4">
            <MembersTable members={getMembersByStatus("Expiring Soon")} onEdit={openEditDialog} onDelete={(id) => setMemberToDelete({id, permanent: false})} onViewDetails={openDetailsDialog} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="expired" className="mt-4">
            <MembersTable members={getMembersByStatus("Expired")} onEdit={openEditDialog} onDelete={(id) => setMemberToDelete({id, permanent: false})} onViewDetails={openDetailsDialog} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="deleted" className="mt-4">
            <DeletedMembersTable 
              members={filteredDeletedMembers}
              onRestore={setMemberToRestore}
              onPermanentDelete={(id) => setMemberToDelete({id, permanent: true})}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
        
        <AddMemberDialog
          isOpen={isAddMemberDialogOpen}
          setIsOpen={setIsAddMemberDialogOpen}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          member={editingMember}
        />

        <MemberDetailsDialog
          isOpen={isDetailsDialogOpen}
          setIsOpen={setIsDetailsDialogOpen}
          member={viewingMember}
          onEdit={openEditDialog}
        />

      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete?.permanent
                ? "This action cannot be undone. This will permanently delete this member's data from the database."
                : "This will move the member to the deleted list. You can restore them later."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={!!memberToRestore} onOpenChange={(open) => !open && setMemberToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the member to the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRestore(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
