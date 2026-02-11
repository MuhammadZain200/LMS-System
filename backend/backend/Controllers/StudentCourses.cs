using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/courses")]
    [ApiController]
    [Authorize] // Any logged-in user (Student or Instructor)
    public class StudentCoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentCoursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        // List all courses with enrollment status for logged-in user
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            // Get logged-in user ID from JWT
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Fetch courses with minimal data + enrollment status
            var courses = await _context.Courses
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Duration,
                    c.Price,
                    Enrolled = _context.Enrollments
                        .Any(e => e.CourseID == c.Id && e.UserID == userId)
                })
                .ToListAsync();

            return Ok(courses);
        }

        // GET: api/courses/{id}
        // View details of a single course with enrollment status, content
        // (only if enrolled) and classmates list.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseID == id && e.UserID == userId);

            var course = await _context.Courses
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Duration,
                    c.Price,
                    Enrolled = _context.Enrollments
                        .Any(e => e.CourseID == c.Id && e.UserID == userId),

                    // Only expose content to students who are enrolled
                    Content = isEnrolled ? c.Content : null,

                    // Basic list of classmates (students only) when enrolled
                    Classmates = isEnrolled
                        ? _context.Enrollments
                            .Where(e => e.CourseID == c.Id)
                            .Select(e => new ClassmateDTO
                            {
                                Id = e.User.Id,
                                Name = e.User.Name,
                                Email = e.User.Email
                            })
                            .ToList()
                        : new List<ClassmateDTO>()
                })
                .FirstOrDefaultAsync();

            if (course == null) return NotFound("Course not found");

            return Ok(course);
        }
    }
}
