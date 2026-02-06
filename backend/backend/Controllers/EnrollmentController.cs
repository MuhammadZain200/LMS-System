using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/enrollments
        [HttpPost]
        public async Task<IActionResult> Enroll([FromBody] EnrollmentDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            bool alreadyEnrolled = await _context.Enrollments
                .AnyAsync(e => e.UserID == userId && e.CourseID == dto.CourseId);

            if (alreadyEnrolled)
                return BadRequest("Already enrolled in this course");

            var enrollment = new Enrollment
            {
                UserID = userId,
                CourseID = dto.CourseId
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Enrolled successfully" });
        }

        // GET: api/enrollments/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserEnrollments(int userId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.UserID == userId)
                .Include(e => e.Course)
                .Select(e => e.Course)
                .ToListAsync();

            return Ok(enrollments);
        }
    }
}
