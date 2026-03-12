# Profile API Implementation Guide

## Overview
A complete Profile API that allows authenticated users to update their profile information (name, email, password) and upload a profile image. **Role and User ID are read-only and cannot be changed.**

## Files Created/Modified

### 1. **UpdateProfileDTO.cs** (Modified)
- Location: `backend/DTOs/UpdateProfileDTO.cs`
- Accepts form data with:
  - `Name` (string, optional)
  - `Email` (string, optional)
  - `Password` (string, optional) - will be hashed with BCrypt
  - `ProfileImage` (IFormFile, optional)

### 2. **ProfileController.cs** (Modified)
- Location: `backend/Controllers/ProfileController.cs`
- Requires JWT authentication (`[Authorize]`)

#### Endpoints:

##### **GET /api/profile/me** - Get Current User Profile
- Returns read-only user information
- Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Student",
  "profileImageUrl": "/profiles/1.jpg",
  "isActive": true
}
```

##### **PUT /api/profile/{id}** - Update User Profile
- Authorization: Users can update their own profile; admins can update any user's profile
- Accepts `multipart/form-data`
- **Read-only fields** (cannot be changed):
  - `Id` (User ID)
  - `Role` (User role)

#### Features:
- **Name Update**: Optional, trimmed of whitespace
- **Email Update**: 
  - Optional
  - Validates email uniqueness (no duplicates)
- **Password Update**: 
  - Optional
  - Minimum 6 characters
  - Hashed using BCrypt before storage
- **Image Upload**:
  - Accepts: `.jpg`, `.jpeg`, `.png`, `.gif`
  - Max size: 5MB
  - Saves to: `wwwroot/profiles/{userId}{extension}`
  - Stores relative path in database: `/profiles/{userId}{extension}`
- **Directory Creation**: Automatically creates `wwwroot/profiles` directory if it doesn't exist
- **Error Handling**:
  - Returns 403 if user tries to update another user's profile (non-admin)
  - Returns 404 if user not found
  - Returns 400 for invalid file types, file size, duplicate emails, or weak password

### 3. **Program.cs** (Modified)
- Added `app.UseStaticFiles()` middleware to enable serving static files from `wwwroot`
- Placed after CORS and before authentication/authorization

## API Usage

### Get Current User Profile

#### Request Example (curl)
```bash
curl -X GET "https://localhost:5001/api/profile/me" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

#### Postman
1. Set method to `GET`
2. URL: `http://localhost:5000/api/profile/me`
3. Add Header: `Authorization: Bearer {your_jwt_token}`

#### Success Response (200 OK)
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Student",
  "profileImageUrl": "/profiles/1.jpg",
  "isActive": true
}
```

---

### Update User Profile

#### Request Example (curl)
```bash
curl -X PUT "https://localhost:5001/api/profile/1" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -F "Name=John Doe" \
  -F "Email=john.doe@example.com" \
  -F "Password=newPassword123" \
  -F "ProfileImage=@/path/to/image.jpg"
```

#### Postman
1. Set method to `PUT`
2. URL: `http://localhost:5000/api/profile/{userId}`
3. Add Header: `Authorization: Bearer {your_jwt_token}`
4. Body: 
   - Select `form-data`
   - Add key `Name` (text) with value - **Optional**
   - Add key `Email` (text) with value - **Optional**
   - Add key `Password` (text) with value - **Optional** (min 6 chars)
   - Add key `ProfileImage` (file) and select image file - **Optional**

#### Success Response (200 OK)
```json
{
  "message": "Profile updated successfully.",
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "Student",
  "profileImageUrl": "/profiles/1.jpg",
  "isActive": true
}
```

### Error Responses

**403 Forbidden** (Unauthorized update - non-admin updating another user)
```json
{
  "error": "You can only update your own profile."
}
```

**404 Not Found** (User doesn't exist)
```json
{
  "message": "User not found."
}
```

**400 Bad Request** (Email in use)
```json
{
  "message": "Email is already in use."
}
```

**400 Bad Request** (Password too short)
```json
{
  "message": "Password must be at least 6 characters long."
}
```

**400 Bad Request** (Invalid file type)
```json
{
  "message": "Invalid file type. Allowed: jpg, jpeg, png, gif"
}
```

**400 Bad Request** (File too large)
```json
{
  "message": "File size exceeds maximum allowed (5MB)."
}
```

## Database
- The `User` model already includes:
  - `ProfileImageUrl` (nullable string)
  - `Password` (string) - stored hashed
  - `Role` (string)
  - `Id` (int) - primary key
- No new migrations required

## Security Notes
- **Passwords are hashed** using BCrypt before storage
- **JWT authentication** required for all endpoints
- **Role and ID are immutable** - cannot be changed via API
- **Email uniqueness** is enforced
- **File uploads** validated for type and size
- **Admin override** available - admins can update any user's profile

## Testing Checklist
- [ ] Get user profile (GET /api/profile/me)
- [ ] Update name only
- [ ] Update email only
- [ ] Update password only
- [ ] Update name, email, and password
- [ ] Upload profile image
- [ ] Update all fields (name, email, password, image)
- [ ] Test email duplicate validation
- [ ] Test password validation (< 6 chars)
- [ ] Test file type validation
- [ ] Test file size validation
- [ ] Test authorization (non-admin updating another user)
- [ ] Verify password is hashed in database
- [ ] Verify Id and Role cannot be changed
- [ ] Verify static file serving (access `/profiles/{userId}.{ext}` in browser)
- [ ] Test admin updating another user's profile

## Example Full Workflow

```bash
# 1. Register new user
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Student"
  }'

# 2. Login to get JWT token
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
# Response contains: { "token": "eyJ0eXAi..." }

# 3. Get profile
curl -X GET "http://localhost:5000/api/profile/me" \
  -H "Authorization: Bearer eyJ0eXAi..."

# 4. Update profile with new password and image
curl -X PUT "http://localhost:5000/api/profile/1" \
  -H "Authorization: Bearer eyJ0eXAi..." \
  -F "Name=Jane Doe" \
  -F "Email=jane@example.com" \
  -F "Password=newPassword123" \
  -F "ProfileImage=@C:\Users\Pictures\profile.jpg"
```

## Notes
- Profile images are stored in `wwwroot/profiles/` directory
- File naming: `{userId}.{extension}` (e.g., `1.jpg`, `5.png`)
- The application automatically creates the profiles directory on first upload
- Static files are served from `wwwroot`, allowing images to be accessed via HTTP
- All field updates in PUT request are optional - only send fields you want to update
