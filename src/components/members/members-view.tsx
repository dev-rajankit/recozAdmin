
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
  const [members, setMembers] = useState<Member[]>([]);
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

  const fetchActiveMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch active members');
      const data = await response.json();
      setMembers(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchDeletedMembers = useCallback(async () => {
    // No need to set loading here, as it's a background fetch
    try {
      const response = await fetch('/api/members?includeDeleted=true');
      if (!response.ok) throw new Error('Failed to fetch deleted members');
      const data = await response.json();
      setDeletedMembers(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }, [toast]);

  useEffect(() => {
    fetchActiveMembers();
    fetchDeletedMembers();
  }, [fetchActiveMembers, fetchDeletedMembers]);
  
  const handleAddMember = async (memberData: Omit<Member, 'id' | 'status' | 'avatarUrl'>) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const newMember = await response.json();
      if (!response.ok) throw new Error(newMember.message || 'Failed to add member');
      
      setMembers(prev => [...prev, newMember]);
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
      
      setMembers(prev => prev.map(m => m.id === updatedMemberFromServer.id ? updatedMemberFromServer : m));
      
      toast({ title: 'Success', description: 'Member updated successfully.' });
      
      if (viewingMember?.id === updatedMemberFromServer.id) {
        setViewingMember(updatedMemberFromServer);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating member', description: error.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if(!memberToDelete) return;
    const { id, permanent } = memberToDelete;
    
    try {
      const url = permanent ? `/api/members/${id}?permanent=true` : `/api/members/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete member');
      
      toast({ title: 'Success', description: data.message });

      // Refetch both lists to ensure UI is perfectly in sync with DB
      fetchActiveMembers();
      fetchDeletedMembers();

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting member', description: error.message });
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!memberToRestore) return;

    try {
      const response = await fetch(`/api/members/${memberToRestore}/restore`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to restore member');
      toast({ title: 'Success', description: 'Member restored successfully.' });
      
      // Refetch both lists
      fetchActiveMembers();
      fetchDeletedMembers();

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error restoring member', description: error.message });
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
    let listToFilter: Member[];

    switch(activeTab) {
        case 'active':
            listToFilter = members.filter(m => m.status === 'Active');
            break;
        case 'expiring':
            listToFilter = members.filter(m => m.status === 'Expiring Soon');
            break;
        case 'expired':
            listToFilter = members.filter(m => m.status === 'Expired');
            break;
        case 'deleted':
            listToFilter = deletedMembers;
            break;
        case 'all':
        default:
            listToFilter = members;
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
  }, [members, deletedMembers, activeTab, searchQuery]);

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
