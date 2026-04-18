const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED"

export interface TicketResponse {
  id: string
  reporterName: string
  reporterEmail: string
  category: string
  description: string
  priority: TicketPriority
  preferredContact: string
  attachmentUrls: string[]
  status: TicketStatus
  assignedTechnicianName: string | null
  assignedTechnicianEmail: string | null
  rejectionReason: string | null
  resolutionNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTicketRequest {
  category: string
  description: string
  priority: TicketPriority
  preferredContact: string
  attachmentUrls: string[]
}

export interface CommentResponse {
  id: string
  ticketId: string
  authorName: string
  authorEmail: string
  content: string
  createdAt: string
  updatedAt: string
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${input}`, {
    credentials: "include",
    ...init,
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Request failed with status ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function getMyTickets(): Promise<TicketResponse[]> {
  return request<TicketResponse[]>("/api/v1/tickets")
}

export async function getTicketById(id: string): Promise<TicketResponse> {
  return request<TicketResponse>(`/api/v1/tickets/${id}`)
}

export async function createTicket(data: CreateTicketRequest): Promise<TicketResponse> {
  return request<TicketResponse>("/api/v1/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteTicket(id: string): Promise<void> {
  return request<void>(`/api/v1/tickets/${id}`, { method: "DELETE" })
}

export async function updateTicketStatus(id: string, status: TicketStatus, rejectionReason?: string, resolutionNotes?: string): Promise<TicketResponse> {
  return request<TicketResponse>(`/api/v1/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason, resolutionNotes }),
  })
}

export async function getComments(ticketId: string): Promise<CommentResponse[]> {
  return request<CommentResponse[]>(`/api/v1/tickets/${ticketId}/comments`)
}

export async function addComment(ticketId: string, content: string): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/v1/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  })
}

export async function editComment(ticketId: string, commentId: string, content: string): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/v1/tickets/${ticketId}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  })
}

export async function deleteComment(ticketId: string, commentId: string): Promise<void> {
  return request<void>(`/api/v1/tickets/${ticketId}/comments/${commentId}`, { method: "DELETE" })
}
