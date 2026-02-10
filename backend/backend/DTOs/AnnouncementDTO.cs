namespace backend.DTOs
{
    /// <summary>
    /// DTO for creating a new announcement.
    /// </summary>
    public class AnnouncementDTO
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
    }
}


