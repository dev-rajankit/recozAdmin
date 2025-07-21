
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
import { MemberDetailsDialog } from "./member-details-dialog";

type TabValue = "all" | "active" | "expiring" | "expired";

export function MembersView() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch member data');
      const data = await response.json();
      setAllMembers(data);
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
      
      await fetchMembers();
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
      
      await fetchMembers();
      toast({ title: 'Success', description: 'Member updated successfully.' });
      
      if (viewingMember?.id === updatedMemberFromServer.id) {
        setViewingMember(updatedMemberFromServer);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating member', description: error.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`/api/members/${memberToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete member');
      }

      await fetchMembers();
      toast({ title: 'Success', description: 'Member permanently deleted.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting member', description: error.message });
    } finally {
      setMemberToDelete(null);
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
    let listToFilter = allMembers;

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
        case 'all':
        default:
            break;
    }

    if (!searchQuery) {
        return listToFilter;
    }

    return listToFilter.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.phone && member.phone.includes(searchQuery)) ||
      (member.seatNumber && member.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allMembers, activeTab, searchQuery]);


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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <MembersTable 
                members={filteredMembers} 
                onEdit={openEditDialog} 
                onDelete={setMemberToDelete} 
                onViewDetails={openDetailsDialog} 
                isLoading={isLoading} 
            />
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
              This action cannot be undone. This will permanently delete the member from the database.
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
