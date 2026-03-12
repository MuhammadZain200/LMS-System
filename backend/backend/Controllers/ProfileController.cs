using backend.Data;
using backend.DTOs;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProfileController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        /// <summary>
        /// Get current user's profile information.
        /// </summary>
        /// <returns>User profile data (read-only: Id, Role)</returns>
        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var authenticatedUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var user = await _context.Users.FindAsync(authenticatedUserId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(new
            {
                id = user.Id, // Read-only
                name = user.Name,
                email = user.Email,
                role = user.Role, // Read-only
                profileImageUrl = user.ProfileImageUrl,
                isActive = user.IsActive
            });
        }

        /// <summary>
        /// Update user profile information including optional profile image upload and password change.
        /// Role and Id are read-only and cannot be changed.
        /// </summary>
        /// <param name="id">User ID to update</param>
        /// <param name="dto">Profile update data (multipart/form-data: Name, Email, Password, ProfileImage)</param>
        /// <returns>Success message with updated profile information</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromForm] UpdateProfileDTO dto)
        {
            // Get authenticated user ID from JWT token
            var authenticatedUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            // Authorization: Users can only update their own profile, admins can update any
            if (authenticatedUserId != id && userRole != "Admin")
            {
                return Forbid("You can only update your own profile.");
            }

            // Find the user in the database
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Update Name if provided
            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                user.Name = dto.Name.Trim();
            }

            // Update Email if provided
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                // Check if email is already in use by another user
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == dto.Email && u.Id != id);

                if (emailExists)
                    return BadRequest(new { message = "Email is already in use." });

                user.Email = dto.Email.Trim();
            }

            // Update Password if provided
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                // Validate password strength (optional but recommended)
                if (dto.Password.Length < 6)
                    return BadRequest(new { message = "Password must be at least 6 characters long." });

                // Hash the new password using BCrypt
                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            // Handle profile image upload if provided
            string? profileImageUrl = null;
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                // Validate file type (optional but recommended)
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(dto.ProfileImage.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { message = "Invalid file type. Allowed: jpg, jpeg, png, gif" });

                // Validate file size (max 5MB)
                const long maxFileSize = 5 * 1024 * 1024;
                if (dto.ProfileImage.Length > maxFileSize)
                    return BadRequest(new { message = "File size exceeds maximum allowed (5MB)." });

                // Create profiles directory if it doesn't exist
                var profilesDirectory = Path.Combine(_webHostEnvironment.WebRootPath ?? "wwwroot", "profiles");
                if (!Directory.Exists(profilesDirectory))
                {
                    Directory.CreateDirectory(profilesDirectory);
                }

                // Generate filename: userId + original extension
                var fileName = $"{id}{fileExtension}";
                var filePath = Path.Combine(profilesDirectory, fileName);

                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }

                // Store relative path in database
                profileImageUrl = $"/profiles/{fileName}";
                user.ProfileImageUrl = profileImageUrl;
            }

            // Save changes to the database
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Return success response with updated profile (Id and Role are read-only, never changed)
            return Ok(new
            {
                message = "Profile updated successfully.",
                id = user.Id, // Read-only
                name = user.Name,
                email = user.Email,
                role = user.Role, // Read-only
                profileImageUrl = user.ProfileImageUrl,
                isActive = user.IsActive
            });
        }
    }
}
