using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    /// <summary>
    /// Handles course announcements created by instructors/admins
    /// and visible to enrolled students.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnnouncementsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get announcements for a specific course.
        /// Any authenticated user can hit this, but in practice the UI
        /// only shows it for enrolled students or the course instructor.
        /// </summary>
        [HttpGet("course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> GetByCourse(int courseId)
        {
            var announcements = await _context.Announcements
                .Where(a => a.CourseId == courseId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Message,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(announcements);
        }

        /// <summary>
        /// Create a new announcement for a course.
        /// Instructors may only post for their own courses; admins for any.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] AnnouncementDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest("Title and message are required");
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var course = await _context.Courses.FindAsync(dto.CourseId);
            if (course == null) return NotFound("Course not found");

            if (role == "Instructor" && course.InstructorId != userId)
            {
                return Forbid("You are not assigned to this course");
            }

            var announcement = new Announcement
            {
                CourseId = dto.CourseId,
                CreatedById = userId,
                Title = dto.Title.Trim(),
                Message = dto.Message.Trim()
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Announcement created successfully",
                announcement.Id,
                announcement.Title,
                announcement.Message,
                announcement.CreatedAt
            });
        }
    }
}


