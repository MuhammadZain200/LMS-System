namespace backend.DTOs
{
    /// <summary>
    /// DTO used by Admin to assign an instructor user to a course.
    /// Admin can provide either InstructorId or InstructorEmail.
    /// </summary>
    public class AssignInstructorDTO
    {
        public int InstructorId { get; set; }

        public string? InstructorEmail { get; set; }
    }
}


