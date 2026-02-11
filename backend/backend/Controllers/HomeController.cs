using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Only Admin
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/students
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
    }
}
