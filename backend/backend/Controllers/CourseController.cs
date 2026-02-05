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

        // GET: api/courses
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses.ToListAsync();
            return Ok(courses);
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
                Price = dto.Price
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
    }
}
