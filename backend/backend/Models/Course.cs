namespace backend.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        /// <summary>
        /// Optional plain-text instructor name kept for backwards compatibility
        /// with existing UI and APIs.
        /// </summary>
        public string? Instructor { get; set; }

        public int Duration { get; set; }
        public decimal Price { get; set; }

        /// <summary>
        /// Optional foreign key to the instructor user who owns this course.
        /// This enables instructor-specific views and permissions.
        /// </summary>
        public int? InstructorId { get; set; }
        public User? InstructorUser { get; set; }

        /// <summary>
        /// Main course learning content (syllabus, lessons, etc.).
        /// Students can only view this once enrolled.
        /// </summary>
        public string? Content { get; set; }

        public List<Enrollment> Enrollments { get; set; }

        public List<Announcement> Announcements { get; set; }
    }
}
