"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MembersTable } from "./members-table";
import { AddMemberDialog } from "./add-member-dialog";
import { members as allMembersData } from "@/lib/data";
import { Member, MemberStatus } from "@/types";

export function MembersView() {
  const [members, setMembers] = useState<Member[]>(allMembersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const handleAddMember = (member: Omit<Member, 'id' | 'status' | 'avatarUrl'>) => {
    const newMember: Member = {
      ...member,
      id: (members.length + 1).toString(),
      status: 'Active', // Default status, can be recalculated
      avatarUrl: `https://placehold.co/40x40.png`
    };
    setMembers(prev => [...prev, newMember]);
  };
  
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
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
          <MembersTable members={filteredMembers} onEdit={openEditDialog} onDelete={handleDeleteMember} />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <MembersTable members={getMembersByStatus("Active")} onEdit={openEditDialog} onDelete={handleDeleteMember} />
        </TabsContent>
        <TabsContent value="expiring" className="mt-4">
          <MembersTable members={getExpiringSoonMembers()} onEdit={openEditDialog} onDelete={handleDeleteMember} />
        </TabsContent>
        <TabsContent value="expired" className="mt-4">
          <MembersTable members={getMembersByStatus("Expired")} onEdit={openEditDialog} onDelete={handleDeleteMember} />
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
  );
}
