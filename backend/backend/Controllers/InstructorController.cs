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
    /// Instructor-focused APIs:
    /// - View own courses
    /// - View students enrolled in those courses
    /// - Manage course content
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin")]
    public class InstructorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InstructorController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get the list of courses assigned to the logged-in instructor.
        /// Admins will get all courses by default.
        /// </summary>
        [HttpGet("my-courses")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            IQueryable<Course> query = _context.Courses.AsQueryable();

            if (role == "Instructor")
            {
                query = query.Where(c => c.InstructorId == userId);
            }

            var courses = await query
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Duration,
                    c.Price,
                    c.Instructor,
                    c.InstructorId
                })
                .ToListAsync();

            return Ok(courses);
        }

        /// <summary>
        /// Get students enrolled in a given course.
        /// Instructors can only see students for their own courses.
        /// Admins can see all.
        /// </summary>
        [HttpGet("courses/{courseId}/students")]
        public async Task<IActionResult> GetCourseStudents(int courseId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found");

            if (role == "Instructor" && course.InstructorId != userId)
            {
                return Forbid("You are not assigned to this course");
            }

            var students = await _context.Enrollments
                .Where(e => e.CourseID == courseId)
                .Include(e => e.User)
                .Select(e => new
                {
                    e.User.Id,
                    e.User.Name,
                    e.User.Email,
                    e.EnrolledAt
                })
                .ToListAsync();

            return Ok(students);
        }

        /// <summary>
        /// Get detailed course info including content and enrolled students
        /// for instructor/admin views.
        /// </summary>
        [HttpGet("courses/{courseId}")]
        public async Task<IActionResult> GetCourseDetails(int courseId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var course = await _context.Courses
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.User)
                .Include(c => c.Announcements)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return NotFound("Course not found");

            if (role == "Instructor" && course.InstructorId != userId)
            {
                return Forbid("You are not assigned to this course");
            }

            var result = new
            {
                course.Id,
                course.Title,
                course.Description,
                course.Duration,
                course.Price,
                course.Instructor,
                course.InstructorId,
                course.Content,
                Students = course.Enrollments.Select(e => new
                {
                    e.User.Id,
                    e.User.Name,
                    e.User.Email,
                    e.EnrolledAt
                }),
                Announcements = course.Announcements
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        a.Id,
                        a.Title,
                        a.Message,
                        a.CreatedAt
                    })
            };

            return Ok(result);
        }

        /// <summary>
        /// Update course content (syllabus, materials, etc.).
        /// Instructors can only update their own courses.
        /// </summary>
        [HttpPut("courses/{courseId}/content")]
        public async Task<IActionResult> UpdateCourseContent(int courseId, [FromBody] CourseContentDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Content))
            {
                return BadRequest("Content is required");
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found");

            if (role == "Instructor" && course.InstructorId != userId)
            {
                return Forbid("You are not assigned to this course");
            }

            course.Content = dto.Content;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Course content updated successfully" });
        }
    }
}


