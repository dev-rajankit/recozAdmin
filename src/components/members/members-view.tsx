"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  const fetchMembers = useCallback(async (tab: TabValue) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/members?tab=${tab}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }
      const data = await response.json();
      setMembers(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error fetching members', description: error.message });
      setMembers([]); // Clear members on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMembers(activeTab);
  }, [activeTab, fetchMembers]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabValue);
  };

  const refreshCurrentTabData = () => {
    fetchMembers(activeTab);
  }

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
      refreshCurrentTabData();
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update member');
      toast({ title: 'Success', description: 'Member updated successfully.' });
      refreshCurrentTabData();
      
      if (viewingMember?.id === updatedMemberData.id) {
        setViewingMember({ ...data, id: data._id });
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
      refreshCurrentTabData();
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
      refreshCurrentTabData();
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
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      (member.seatNumber && member.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, searchQuery]);

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

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
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
