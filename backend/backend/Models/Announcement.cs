using System;

namespace backend.Models
{
    /// <summary>
    /// Represents an announcement made for a specific course
    /// by an instructor or admin.
    /// </summary>
    public class Announcement
    {
        public int Id { get; set; }

        /// <summary>
        /// The course this announcement belongs to.
        /// </summary>
        public int CourseId { get; set; }
        public Course Course { get; set; }

        /// <summary>
        /// The user (instructor/admin) who created the announcement.
        /// </summary>
        public int CreatedById { get; set; }
        public User CreatedBy { get; set; }

        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


