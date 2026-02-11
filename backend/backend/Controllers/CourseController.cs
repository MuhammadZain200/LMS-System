using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Only admin can access
    public class CourseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Course
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses.ToListAsync();
            return Ok(courses);
        }

        // GET: api/Course/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound("Course not found");
            return Ok(course);
        }

        // POST: api/courses
        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody] CourseDTO dto)
        {
            var course = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                Duration = dto.DurationInHours,
                Price = dto.Price,
                Content = dto.Content
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return Ok(course);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseDTO dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound("Course not found");

            course.Title = dto.Title;
            course.Description = dto.Description;
            course.Duration = dto.DurationInHours;
            course.Price = dto.Price;
            course.Instructor = dto.Instructor;
            course.Content = dto.Content ?? course.Content;

            await _context.SaveChangesAsync();

            return Ok(course);
        }

        // DELETE: api/courses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound("Course not found");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Course deleted successfully" });
        }

        /// <summary>
        /// Assign an instructor user to a course.
        /// Only Admins can call this endpoint.
        /// Accepts either instructor ID or email.
        /// </summary>
        [HttpPut("{id}/assign-instructor")]
        public async Task<IActionResult> AssignInstructor(int id, [FromBody] AssignInstructorDTO dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound("Course not found");

            if (dto == null || (dto.InstructorId <= 0 && string.IsNullOrWhiteSpace(dto.InstructorEmail)))
            {
                return BadRequest("InstructorId or InstructorEmail is required");
            }

            IQueryable<User> query = _context.Users.Where(u => u.Role == "Instructor");

            if (dto.InstructorId > 0)
            {
                query = query.Where(u => u.Id == dto.InstructorId);
            }
            else if (!string.IsNullOrWhiteSpace(dto.InstructorEmail))
            {
                var normalizedEmail = dto.InstructorEmail.Trim().ToLower();
                query = query.Where(u => u.Email.ToLower() == normalizedEmail);
            }

            var instructor = await query.FirstOrDefaultAsync();

            if (instructor == null)
            {
                return BadRequest("Invalid instructor ID or user is not an instructor");
            }

            // Persist both the FK and the human-readable name for existing UI
            course.InstructorId = instructor.Id;
            course.Instructor = instructor.Name;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Instructor assigned successfully",
                courseId = course.Id,
                instructorId = instructor.Id,
                instructorName = instructor.Name
            });
        }

        /// <summary>
        /// Get all student accounts.
        /// Only Admins can access this endpoint.
        /// </summary>
        // GET: api/courses/students
        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.IsActive
                })
                .ToListAsync();

            return Ok(students);
        }


        [HttpPut("students/{id}/status")]
        public async Task<IActionResult> UpdateStudentStatus(int id, [FromQuery] bool isActive)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Student");

            if (student == null)
                return NotFound("Student not found");

            student.IsActive = isActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student status updated" });
        }

      
        [HttpGet("students/{studentId}/enrollments")]
        public async Task<IActionResult> GetStudentEnrollments(int studentId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.UserID == studentId)
                .Include(e => e.Course)
                .Select(e => new
                {
                    CourseId = e.Course.Id,
                    CourseTitle = e.Course.Title,  // Add this property in EnrollmentDTO
                    EnrollDate = e.EnrolledAt      // Add this property in EnrollmentDTO
                })
                .ToListAsync();

            return Ok(enrollments);
        }


        
        [HttpGet("courses/{courseId}/students")]
        public async Task<IActionResult> GetStudentsByCourse(int courseId)
        {
            var students = await _context.Enrollments
                .Where(e => e.CourseID == courseId)
                .Include(e => e.User)
                .Select(e => new
                {
                    e.User.Id,
                    e.User.Name,
                    e.User.Email
                })
                .ToListAsync();

            return Ok(students);
        }
    }
}
