const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export interface BookingResponse {
  id: number
  facilityId: number
  facilityName: string
  userEmail: string
  startTime: string
  endTime: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  purpose: string
  attendees?: number | null
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface BookingRequest {
  facilityId: number
  startTime: string
  endTime: string
  purpose: string
  attendees?: number
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string }
    return data.message ?? data.error ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${input}`, {
    credentials: "include",
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status)
  }

  return (await response.json()) as T
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  return request<BookingResponse[]>("/api/v1/bookings/me")
}

export async function getAllBookings(status?: string, facilityId?: number): Promise<BookingResponse[]> {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (typeof facilityId === "number") params.set("facilityId", String(facilityId))

  const query = params.toString()
  return request<BookingResponse[]>(`/api/v1/bookings${query ? `?${query}` : ""}`)
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return request<BookingResponse>("/api/v1/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
}

export async function cancelBooking(id: number): Promise<BookingResponse> {
  return request<BookingResponse>(`/api/v1/bookings/${id}`, {
    method: "DELETE",
  })
}

export async function approveBooking(id: number): Promise<BookingResponse> {
  return request<BookingResponse>(`/api/v1/bookings/${id}/approve`, {
    method: "PATCH",
  })
}

export async function rejectBooking(id: number, reason: string): Promise<BookingResponse> {
  return request<BookingResponse>(`/api/v1/bookings/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rejectionReason: reason }),
  })
}
