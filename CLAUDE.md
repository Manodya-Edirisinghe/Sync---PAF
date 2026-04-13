# Smart Campus Operations Hub — Module A

## My role
I am implementing Module A – Facilities & Assets Catalogue.
This is a group assignment. Module E (Auth) is already done by another member.

## Stack
- Backend: Spring Boot 3.x, Java 17+, Maven
- Frontend: React (Vite), Tailwind CSS
- Database: [write yours here — e.g. MySQL]
- Auth: Google OAuth2 — already implemented (Module E)
- Roles: USER and ADMIN

## What already works (Module E — do NOT re-implement)
- Google Sign-In (OAuth2)
- JWT token generation and validation
- Role-based security config (SecurityFilterChain)
- User dashboard (accessible after login)
- Admin console (accessible to ADMIN role)

## My module scope (Module A only)
1. Facility entity: id, name, type, capacity, location,
   availabilityWindows, status, createdAt, updatedAt
2. REST API under /api/v1/facilities
3. Search and filter: type, minCapacity, location, status
4. React UI: catalogue page, detail page, admin panel

## Backend package structure
com.smartcampus.facilities
  ├── controller   (FacilityController)
  ├── service      (FacilityService, FacilityServiceImpl)
  ├── repository   (FacilityRepository)
  ├── model        (Facility entity, enums)
  └── dto          (FacilityRequestDto, FacilityResponseDto)

## Coding conventions
- RESTful naming: /api/v1/facilities (nouns not verbs)
- Always use DTOs — never expose entity directly in responses
- HTTP status codes: 200 OK, 201 Created, 204 No Content,
  400 Bad Request, 404 Not Found, 403 Forbidden
- Use @PreAuthorize("hasRole('ADMIN')") for write endpoints
- One GlobalExceptionHandler for all error responses
- Commit after every working endpoint