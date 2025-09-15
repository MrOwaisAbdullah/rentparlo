"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Bot,
  Paperclip,
  Send,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface SupportMessage {
  id: string;
  sender: "user" | "support" | "system";
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isInternal?: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "billing"
    | "technical"
    | "account"
    | "listing"
    | "verification"
    | "other";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: SupportMessage[];
  tags: string[];
  satisfaction?: {
    rating: number;
    feedback: string;
  };
}

interface SupportTicketIntegrationProps {
  sellerId: string;
  initialTickets?: SupportTicket[];
}

const statusColors = {
  open: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const categoryIcons = {
  billing: "💳",
  technical: "🔧",
  account: "👤",
  listing: "📝",
  verification: "✅",
  other: "❓",
};

export function SupportTicketIntegration({
  sellerId,
  initialTickets = [],
}: SupportTicketIntegrationProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "other" as SupportTicket["category"],
    priority: "medium" as SupportTicket["priority"],
  });

  const refreshTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/support/tickets?sellerId=${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error refreshing tickets:", error);
      toast.error("Failed to refresh tickets");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          ...newTicket,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `msg_${Date.now()}`,
              sender: "user",
              senderName: "You",
              message: newTicket.description,
              timestamp: new Date().toISOString(),
            },
          ],
          tags: [],
        }),
      });

      if (response.ok) {
        const createdTicket = await response.json();
        setTickets((prev) => [createdTicket, ...prev]);
        setNewTicket({
          subject: "",
          description: "",
          category: "other",
          priority: "medium",
        });
        setIsCreateDialogOpen(false);
        toast.success("Support ticket created successfully");
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  const sendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `/api/support/tickets/${ticketId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: newMessage,
            sender: "user",
            senderName: "You",
          }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  messages: [...ticket.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : ticket
          )
        );

        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) =>
            prev ? { ...prev, messages: [...prev.messages, message] } : null
          );
        }

        setNewMessage("");
        toast.success("Message sent");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const updateTicketStatus = async (
    ticketId: string,
    status: SupportTicket["status"]
  ) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status, updatedAt: new Date().toISOString() }
              : ticket
          )
        );

        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
        }

        toast.success("Ticket status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "pending"
  );
  const resolvedTickets = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">
            Get help with your account, billing, and technical issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshTickets} variant="outline" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll help you resolve it as quickly
                  as possible.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value: SupportTicket["category"]) =>
                        setNewTicket((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">💳 Billing</SelectItem>
                        <SelectItem value="technical">🔧 Technical</SelectItem>
                        <SelectItem value="account">👤 Account</SelectItem>
                        <SelectItem value="listing">📝 Listing</SelectItem>
                        <SelectItem value="verification">
                          ✅ Verification
                        </SelectItem>
                        <SelectItem value="other">❓ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value: SupportTicket["priority"]) =>
                        setNewTicket((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createTicket}>Create Ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-xl font-bold">{openTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{resolvedTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-xl font-bold">2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? "bg-muted/50 border-primary"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {categoryIcons[ticket.category]}
                          </span>
                          <h4 className="font-medium text-sm truncate">
                            {ticket.subject}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={statusColors[ticket.status]}
                            variant="outline"
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            className={priorityColors[ticket.priority]}
                            variant="outline"
                          >
                            {ticket.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {ticket.messages.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {ticket.messages.length} msgs
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tickets found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTicket ? "Ticket Details" : "Select a Ticket"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                {/* Ticket Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{selectedTicket.subject}</h3>
                    <div className="flex gap-2">
                      <Badge
                        className={statusColors[selectedTicket.status]}
                        variant="outline"
                      >
                        {selectedTicket.status}
                      </Badge>
                      <Badge
                        className={priorityColors[selectedTicket.priority]}
                        variant="outline"
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created{" "}
                    {new Date(selectedTicket.createdAt).toLocaleDateString()} •
                    Updated{" "}
                    {new Date(selectedTicket.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Actions */}
                {selectedTicket.status === "open" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateTicketStatus(selectedTicket.id, "resolved")
                      }
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateTicketStatus(selectedTicket.id, "closed")
                      }
                    >
                      Close Ticket
                    </Button>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${
                          message.sender === "user" ? "text-right" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            message.sender === "user"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50 border"
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== "closed" && (
                  <div className="space-y-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach File
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => sendMessage(selectedTicket.id)}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a ticket to view details and messages
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
