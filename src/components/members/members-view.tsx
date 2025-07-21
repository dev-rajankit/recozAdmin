
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersTable } from "./members-table";
import { AddMemberDialog } from "./add-member-dialog";
import { Member } from "@/types";
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

type TabValue = "all" | "active" | "expiring" | "expired" | "deleted";

export function MembersView() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [memberToDelete, setMemberToDelete] = useState<{id: string, permanent: boolean} | null>(null);
  const [memberToRestore, setMemberToRestore] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/members?includeDeleted=true')
      ]);

      if (!activeRes.ok || !deletedRes.ok) {
        throw new Error('Failed to fetch member data');
      }
      const activeData = await activeRes.json();
      const deletedData = await deletedRes.json();

      setAllMembers(activeData);
      setDeletedMembers(deletedData);
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
      const newMember = await response.json();
      if (!response.ok) throw new Error(newMember.message || 'Failed to add member');
      
      setAllMembers(prev => [...prev, newMember]);
      toast({ title: 'Success', description: 'Member added successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding member', description: error.message });
    }
  };
  
  const handleUpdateMember = async (updatedMemberData: Member) => {
     try {
      const response = await fetch(`/api/members/${updatedMemberData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMemberData),
      });
      const updatedMemberFromServer = await response.json();
      if (!response.ok) throw new Error(updatedMemberFromServer.message || 'Failed to update member');
      
      setAllMembers(prev => prev.map(m => m.id === updatedMemberFromServer.id ? updatedMemberFromServer : m));
      
      toast({ title: 'Success', description: 'Member updated successfully.' });
      
      if (viewingMember?.id === updatedMemberFromServer.id) {
        setViewingMember(updatedMemberFromServer);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating member', description: error.message });
    }
  };

  const softDeleteMember = async (memberId: string) => {
    const memberToMove = allMembers.find(m => m.id === memberId);
    if (!memberToMove) return;

    // Optimistic UI Update
    setAllMembers(prev => prev.filter(m => m.id !== memberId));
    setDeletedMembers(prev => [...prev, {...memberToMove, deletedAt: new Date()}]);
    setMemberToDelete(null);

    try {
        const response = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete member');
        toast({ title: 'Success', description: data.message });
        // No need to refetch, UI is already updated.
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error deleting member', description: error.message });
        // Revert UI on error
        setDeletedMembers(prev => prev.filter(m => m.id !== memberId));
        setAllMembers(prev => [...prev, memberToMove]);
    }
  };

  const permanentDeleteMember = async (memberId: string) => {
     // Optimistic UI Update
    setDeletedMembers(prev => prev.filter(m => m.id !== memberId));
    setMemberToDelete(null);
    try {
      const url = `/api/members/${memberId}?permanent=true`;
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete member');
      toast({ title: 'Success', description: data.message });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error permanently deleting', description: error.message });
      // On error, we should probably refetch to get the real state
      fetchMembers();
    }
  };

  const handleDeleteConfirm = () => {
    if (!memberToDelete) return;
    if (memberToDelete.permanent) {
      permanentDeleteMember(memberToDelete.id);
    } else {
      softDeleteMember(memberToDelete.id);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!memberToRestore) return;
    const memberToMove = deletedMembers.find(m => m.id === memberToRestore);
    if (!memberToMove) return;

    // Optimistic UI Update
    setDeletedMembers(prev => prev.filter(m => m.id !== memberToRestore));
    setAllMembers(prev => [...prev, {...memberToMove, deletedAt: null}]);
    setMemberToRestore(null);

    try {
      const response = await fetch(`/api/members/${memberToRestore}/restore`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to restore member');
      toast({ title: 'Success', description: 'Member restored successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error restoring member', description: error.message });
      // Revert UI on error
      setAllMembers(prev => prev.filter(m => m.id !== memberToRestore));
      setDeletedMembers(prev => [...prev, memberToMove]);
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
    let listToFilter: Member[];

    switch(activeTab) {
        case 'active':
            listToFilter = allMembers.filter(m => m.status === 'Active');
            break;
        case 'expiring':
            listToFilter = allMembers.filter(m => m.status === 'Expiring Soon');
            break;
        case 'expired':
            listToFilter = allMembers.filter(m => m.status === 'Expired');
            break;
        case 'deleted':
            listToFilter = deletedMembers;
            break;
        case 'all':
        default:
            listToFilter = allMembers;
            break;
    }

    if (!searchQuery) {
        return listToFilter;
    }

    return listToFilter.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      (member.seatNumber && member.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allMembers, deletedMembers, activeTab, searchQuery]);

  const renderTable = () => {
    if (activeTab === 'deleted') {
      return (
        <DeletedMembersTable 
          members={filteredMembers}
          onRestore={setMemberToRestore}
          onPermanentDelete={(id) => setMemberToDelete({id, permanent: true})}
          isLoading={isLoading}
        />
      );
    }
    return (
      <MembersTable 
        members={filteredMembers} 
        onEdit={openEditDialog} 
        onDelete={(id) => setMemberToDelete({id, permanent: false})} 
        onViewDetails={openDetailsDialog} 
        isLoading={isLoading} 
      />
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, seat..."
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="deleted">Deleted</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            {renderTable()}
          </div>
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
